import keras.layers as KLayers

# instance:true, apply:true
def _Merge(*args, layer=KLayers.Add, **kwargs):
	L = layer(*args, **kwargs)
	return  lambda *ls: L(list(ls))



def Add(*args, **kwargs):
	return _Merge(*args, **kwargs, layer=KLayers.Add)

def Average(*args, **kwargs):
	return _Merge(*args, **kwargs, layer=KLayers.Average)

def Concatenate(*args, **kwargs):
	return _Merge(*args, **kwargs, layer=KLayers.Concatenate)

def Dot(*args, **kwargs):
	return _Merge(*args, **kwargs, layer=KLayers.Dot)

def Maximum(*args, **kwargs):
	return _Merge(*args, **kwargs, layer=KLayers.Maximum)

def Minimum(*args, **kwargs):
	return _Merge(*args, **kwargs, layer=KLayers.Minimum)

def Multiply(*args, **kwargs):
	return _Merge(*args, **kwargs, layer=KLayers.Multiply)

def Subtract(*args, **kwargs):
	return _Merge(*args, **kwargs, layer=KLayers.Subtract)
