import numpy as np
import keras.utils as KUtils



def dataset(dataset, train, test=None):
	if test is not None:
		return (dataset[train], dataset[test])
	else:
		return (dataset[train], None)

def to_categorical(data, **kwargs):
	if isinstance(data, tuple) or isinstance(data, list):
		return data.__class__([
			KUtils.to_categorical(d, **kwargs)
			if d is not None else None
			for d in data ])
	else:
		return KUtils.to_categorical(data, **kwargs)
