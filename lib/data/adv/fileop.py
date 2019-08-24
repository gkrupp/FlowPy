import cv2
import fnmatch
import os
import re
import sys

import keras
import keras.backend as K

import foolbox




# [ Classes ]


# abstract batch item

class BatchItem:
	def __init__(self, data=None, label=None, loaded=False):
		self.data = data             # input data
		self.label = label           # input data's original label/category
		self.loaded = loaded         # True if the data is in ht memory
		self.preprocessing = None    # preprocessing tuple (subtraction, division, multiplication)
	
	# load to memory
	def load(self):
		self.loaded = True
		print('Undefined data source type', file=sys.stderr)
		return None
	# flush from memory
	def unload(self):
		self.data = None
		return None
	# save (back) to disk
	def save(self):
		print('Undefined saveing method', file=sys.stderr)
		return None
	# preprocessing
	def preprocess(self):
		self.load()
		if self.data is not None and self.preprocessing is not None:
			self.data = self.data - self.preprocessing[0]
			self.data = self.data / self.preprocessing[1]
			self.data = self.data * self.preprocessing[2]
			self.preprocessing = None
#

# Batch wrapper

class Batch:
	def __init__(self, *batches):
		self.items = []              # batch item array
		for batch in batches:
			if isinstance(batch, Batch):
				self.items += batch.items
			else:
				self.items.append(batch)
	
	# overload (+) operator to join batches
	def __add__(self, other):
		return Batch(self.items + other.items)
	# function for single batch item addition
	def append(self, item):
		if isinstance(item, BatchItem): self.items.append(item)
		else: print('Item is not a BatchItem', file=sys.stderr)
	# load all utem to memory
	def load(self):
		for item in self.items:
			item.load()
		# flosh all item from memory
	def unload(self):
		for item in self.items:
			item.unload()
#

# Image wrapper

class Image(BatchItem):
	def __init__(self, path, color=True):
		super(Image, self).__init__()
		self.path = path             # image location 
		self.name = re.compile(r'[\\/]').split(path)[-1] # name of the image with extension
		self.color = color           # True if the image was loaded in color mode
	
	# load the image
	def load(self):
		if self.loaded:
			return None
		try:
			if self.color:
				self.data = cv2.imread(self.path, cv2.IMREAD_COLOR)
			else:
				im = cv2.imread(self.path, cv2.IMREAD_GRAYSCALE)
				self.data = im.reshape(im.shape[0], im.shape[1], 1)
		except Exception as e:
			print('Image cannot be loaded: ' + self.path, file=sys.stderr)
		self.loaded = True
		return None
	# save the image to the disk (if name wasn't changed, it will overwrite tho original)
	def save(self, path=None):
		if path is None:
			path = self.path
		cv2.imwrite(path, self.data)
		return None
#




# [ File operations ]

# search all files on the working directory
# which meet the given requirements
def files_find(root='.', pattern='*', recursive=True):
	# recursive scan function
	def walk(root='.', patterns=['*'], recursive=True, level=1):
		pattern = '/'.join(patterns[:level])
		files = []
		for file in os.scandir(root):
			filename = file.name if root=='.' else os.path.join(root, file.name).replace('\\', '/')
			if not fnmatch.fnmatch(filename, pattern):
				continue
			if file.is_dir() and recursive:
				files += walk(filename, patterns, recursive, level+1)
			elif file.is_file() and level>=len(patterns):
				files.append(filename)
		return files
	startlevel = 1
	if recursive:
		root = '.'
	else:
		dirs = re.compile(r'[\\/]').split(pattern)
		startlevel = len(dirs)
		root = '/'.join(dirs[:-1])
	return walk(root, re.compile(r'[\\/]').split(pattern), recursive, level=startlevel)


# label loader
def loader_labels(path):
	labelmap = {}
	with open(path) as f:
		for line in f:
			record = re.compile(r'\s+').split(line.rstrip('\n'))
			labelmap[record[0]] = record[1]
	return labelmap

# image loader
def loader_image(pattern, recursive, color=True, default_label='0', label_map={}):
	files = files_find(pattern=pattern, recursive=recursive)
	btch = Batch(*[ Image(file, color=color) for file in files ])
	for item in btch.items:
		if item.name in label_map:
			item.label = label_map[item.name]
		else:
			item.label = default_label
	return btch

# Keras model loader
def loader_keras(path, bounds=(0,1), channel_axis=3, predicts='probabilities'):
	kmodel = keras.models.load_model(path)
	fmodel = foolbox.models.KerasModel(
		model=kmodel,
		bounds=bounds,
		channel_axis=channel_axis,
		predicts=predicts)
	return fmodel

# image saver
def saver_image(*batch):
	if not isinstance(batch[-1], str):
		raise ValueError("Path must be set")
	path = batch[-1]
	btch = Batch(*(batch[:-1]))
	for item in btch.items:
		item.preprocess()
		item.save(path=os.path.join(path, item.name))
	return None

# data transformation function
# doesn't execute the actual transformation
# the transformation stacked up and executed only if it is required for the further processing
def preprocessing(*batch, **kwargs):
	btch = Batch(*batch)
	for item in btch.items:
		pre = item.preprocessing
		if pre is None:
			pre = (0, 1, 1)
		pre = (
			pre[0]-kwargs['subtract'],
			pre[1]*kwargs['divide'],
			pre[2]*kwargs['multiply'])
		item.preprocessing = pre
	return btch

# rename the images in the whole Batch
def rename(*batch, **kwargs):
	btch = Batch(*batch)
	prefix = kwargs['prefix'] if 'prefix' in kwargs else ''
	suffix = kwargs['suffix'] if 'suffix' in kwargs else ''
	for item in btch.items:
		parts = item.name.split('.')
		name = '.'.join(parts[:-1])
		extension  = parts[-1]
		item.name = prefix + name + suffix + '.' + extension
	return btch

