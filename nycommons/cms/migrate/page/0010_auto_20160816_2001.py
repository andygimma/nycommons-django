# -*- coding: utf-8 -*-
# Generated by Django 1.9.9 on 2016-08-17 00:01
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('page', '0009_auto_20160813_1747'),
    ]

    operations = [
        migrations.AlterField(
            model_name='applicationcontent',
            name='urlconf_path',
            field=models.CharField(choices=[(b'faq.urls', 'FAQ'), (b'reviewpathways.urls', 'Review Pathways'), (b'extraadmin.cms_urls', 'Extra admin functions'), (b'ownerpathways.urls', 'Owner Pathways'), (b'livinglots_lots.map_urls', 'Lots map'), (b'organizingpathways.urls', 'Organizing Pathways'), (b'elephantblog.urls', 'Blog'), (b'contact_form', 'Contact form')], max_length=100, verbose_name='application'),
        ),
    ]