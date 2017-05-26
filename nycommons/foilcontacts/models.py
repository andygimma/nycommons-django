# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models

# Create your models here.
class FoilContact(models.Model):
    foil_officer_name = models.CharField(max_length=500)
    foil_officer_email = models.EmailField(max_length=500)
    appeal_officer_name = models.CharField(max_length=500)
    appeal_officer_email = models.EmailField(max_length=500)
