import os
import platform
import requests
import sys

from shutil import copyfile
from setuptools import setup, find_packages

#
def wget(url, path=None):
	response = requests.get(url, stream=True)
	filename = url.split("/")[-1] if path is None else path
	with open(filename, 'wb') as f:
		f.write(response.content)
#


# installation root
dirname = os.path.dirname(__file__)
if dirname:
	os.chdir(dirname)
copyfile('flowpy.py', 'flowpy')

# cmd scripts
scripts = [
	'flowpy'
]

# retrive files
wget('https://gojs.net/latest/release/go.js', 'lib/static/js/go.js')
wget('https://gojs.net/latest/release/go-debug.js', 'lib/static/js/go-debug.js')




if __name__ == '__main__':
	
	setup(
		name='flowpy',
		version='1.0',
		packages=find_packages(),
		include_package_data=True,
		zip_safe=True,
		install_requires=[
			'flask', 'flask-socketio', 'waitress',
			'opencv-python', 'tensorflow', 'keras', 'foolbox', 'randomgen', 'h5py'],
		description='Adversarial image generation framework',
		author='Gabor Kruppai',
		author_email='a180fm@inf.elte.hu',
		scripts=scripts
	)
	
	