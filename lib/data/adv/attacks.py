import foolbox
import sys

from foolbox import criteria
from foolbox import distances
from foolbox import attacks

from .fileop import Batch




# Configuration type constructor (tuple)
def Configuration(model,
									criterion=criteria.Misclassification(),
									distance=distances.MeanSquaredDistance):
	return (model, criterion, distance)


# Attack applyer
def _Attack(*batch, attack=attacks.GradientAttack, **kwargs):
	if not isinstance(batch[-1], tuple):
		raise ValueError("Configuration must be set")
	configuration = batch[-1]
	btch = Batch(*(batch[:-1]))
	attack = attack(*configuration)
	for item in btch.items:
		item.load()
		item.preprocess()
		adv = attack(item.data, int(item.label), unpack=True, **kwargs)
		if adv is not None:
			item.data = adv
	return btch




# [ Attack adapter function ]


# gradient based

def GradientAttack(*args, **kwargs):
	if len(kwargs['epsilons']) == 0: kwargs['epsilons'] = 100
	return _Attack(*args, **kwargs, attack=attacks.GradientAttack)

def GradientSignAttack(*args, **kwargs):
	if len(kwargs['epsilons']) == 0: kwargs['epsilons'] = 100
	return _Attack(*args, **kwargs, attack=attacks.GradientSignAttack)



def LinfinityBasicIterativeAttack(*args, **kwargs):
	return _Attack(*args, **kwargs, attack=attacks.LinfinityBasicIterativeAttack)

def L1BasicIterativeAttack(*args, **kwargs):
	return _Attack(*args, **kwargs, attack=attacks.L1BasicIterativeAttack)

def L2BasicIterativeAttack(*args, **kwargs):
	return _Attack(*args, **kwargs, attack=attacks.L2BasicIterativeAttack)

def ProjectedGradientDescentAttack(*args, **kwargs):
	return _Attack(*args, **kwargs, attack=attacks.ProjectedGradientDescentAttack)



def MomentumIterativeAttack(*args, **kwargs):
	return _Attack(*args, **kwargs, attack=attacks.MomentumIterativeAttack)



def DeepFoolAttack(*args, **kwargs):
	return _Attack(*args, **kwargs, attack=attacks.DeepFoolAttack)

def DeepFoolL2Attack(*args, **kwargs):
	return _Attack(*args, **kwargs, attack=attacks.DeepFoolL2Attack)

def DeepFoolLinfinityAttack(*args, **kwargs):
	return _Attack(*args, **kwargs, attack=attacks.DeepFoolLinfinityAttack)

def NewtonFoolAttack(*args, **kwargs):
	return _Attack(*args, **kwargs, attack=attacks.NewtonFoolAttack)



def ADefAttack(*args, **kwargs):
	return _Attack(*args, **kwargs, attack=attacks.ADefAttack)

def SLSQPAttack(*args, **kwargs):
	return _Attack(*args, **kwargs, attack=attacks.SLSQPAttack)

def SaliencyMapAttack(*args, **kwargs):
	return _Attack(*args, **kwargs, attack=attacks.SaliencyMapAttack)



def IterativeGradientAttack(*args, **kwargs):
	if len(kwargs['epsilons']) == 0: kwargs['epsilons'] = 100
	return _Attack(*args, **kwargs, attack=attacks.IterativeGradientAttack)

def IterativeGradientSignAttack(*args, **kwargs):
	if len(kwargs['epsilons']) == 0: kwargs['epsilons'] = 100
	return _Attack(*args, **kwargs, attack=attacks.IterativeGradientSignAttack)



def CarliniWagnerL2Attack(*args, **kwargs):
	return _Attack(*args, **kwargs, attack=attacks.CarliniWagnerL2Attack)



# score based

def SinglePixelAttack(*args, **kwargs):
	return _Attack(*args, **kwargs, attack=attacks.SinglePixelAttack)

def LocalSearchAttack(*args, **kwargs):
	return _Attack(*args, **kwargs, attack=attacks.LocalSearchAttack)



# decision based

def BoundaryAttack(*args, **kwargs):
	return _Attack(*args, **kwargs, attack=attacks.BoundaryAttack)

def SpatialAttack(*args, **kwargs):
	return _Attack(*args, **kwargs, attack=attacks.SpatialAttack)

def PointwiseAttack(*args, **kwargs):
	return _Attack(*args, **kwargs, attack=attacks.PointwiseAttack)

def GaussianBlurAttack(*args, **kwargs):
	if len(kwargs['epsilons']) == 0: kwargs['epsilons'] = 100
	return _Attack(*args, **kwargs, attack=attacks.GaussianBlurAttack)

def ContrastReductionAttack(*args, **kwargs):
	if len(kwargs['epsilons']) == 0: kwargs['epsilons'] = 100
	return _Attack(*args, **kwargs, attack=attacks.ContrastReductionAttack)

def AdditiveUniformNoiseAttack(*args, **kwargs):
	if len(kwargs['epsilons']) == 0: kwargs['epsilons'] = 100
	return _Attack(*args, **kwargs, attack=attacks.AdditiveUniformNoiseAttack)

def AdditiveGaussianNoiseAttack(*args, **kwargs):
	if len(kwargs['epsilons']) == 0: kwargs['epsilons'] = 100
	return _Attack(*args, **kwargs, attack=attacks.AdditiveGaussianNoiseAttack)

def SaltAndPepperNoiseAttack(*args, **kwargs):
	if len(kwargs['epsilons']) == 0: kwargs['epsilons'] = 100
	return _Attack(*args, **kwargs, attack=attacks.SaltAndPepperNoiseAttack)

def BlendedUniformNoiseAttack(*args, **kwargs):
	if len(kwargs['epsilons']) == 0: kwargs['epsilons'] = 100
	return _Attack(*args, **kwargs, attack=attacks.BlendedUniformNoiseAttack)



# other

def BinarizationRefinementAttack(*args, **kwargs):
	return _Attack(*args, **kwargs, attack=attacks.BinarizationRefinementAttack)

