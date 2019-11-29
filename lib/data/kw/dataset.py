import numpy as np
import keras.utils as KUtils



def dataset(dataset, train, test=None, subtract=0.0, divide=1.0, multiply=1.0):
	if test is not None:
		return (
			(dataset[train]-subtract)/divide*multiply,
			(dataset[test]-subtract)/divide*multiply)
	else:
		return ((dataset[train]-subtract)/divide*multiply, None)

def to_categorical(data, **kwargs):
	if isinstance(data, tuple) or isinstance(data, list):
		return data.__class__([
			KUtils.to_categorical(d, **kwargs)
			if d is not None else None
			for d in data ])
	else:
		return KUtils.to_categorical(data, **kwargs)
