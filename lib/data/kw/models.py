import keras.layers as KLayers
from keras.models import Model as KModel
from keras.optimizers import Optimizer

INPUTS = []


def dataset_extractor(objects, argname='__'):
	train, test = [], []
	if not hasattr(objects, '__iter__'):
		objects = [objects]
	for obj in objects:
		if hasattr(obj, argname):
			curr_train, curr_test = getattr(obj, argname)
			train.append(curr_train)
			if curr_test is not None:
				test.append(curr_test)
	if len(test) == 0:
		test = None
	return (train, test)




def Input(*args, **kwargs):
	input_shape = args[-1]
	binded_input = args[0] if (len(args) > 1) else None
	layer = KLayers.Input(input_shape, **kwargs)
	setattr(layer, '__binded_input', binded_input)
	INPUTS.append(layer)
	return layer

def Output(layer, y=None):
	setattr(layer, '__binded_output', y)
	return layer

def Model(*args, **kwargs):
	input_layers = INPUTS
	output_layers = args[:-1]
	optim = args[-1]
	# model
	model = KModel(inputs=input_layers, outputs=output_layers)
	# summary
	if 'summary' in kwargs:
		if kwargs['summary']:
			model.summary()
		del kwargs['summary']
	# compile
	model.compile(optim, **kwargs)
	return model

def fit(model, **kwargs):
	x_train, x_test = dataset_extractor(model.inputs, '__binded_input')
	y_train, y_test = dataset_extractor(model.outputs, '__binded_output')
	# validation_data
	if x_test is not None and y_test is not None:
		if len(x_test) == len(x_train) and len(y_test) == len(y_train):
			kwargs['validation_data'] = (x_test, y_test)
	# fit
	history = model.fit(x=x_train, y=y_train, **kwargs)
	return history
