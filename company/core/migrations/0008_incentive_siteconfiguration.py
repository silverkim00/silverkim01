# Generated by Django 5.2.4 on 2025-07-16 06:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0007_clientdata_audio_file_2_alter_clientdata_audio_file'),
    ]

    operations = [
        migrations.CreateModel(
            name='Incentive',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('case_count', models.IntegerField(unique=True, verbose_name='성공 건수')),
                ('reward_amount', models.PositiveIntegerField(verbose_name='시상금 (원)')),
            ],
            options={
                'ordering': ['case_count'],
            },
        ),
        migrations.CreateModel(
            name='SiteConfiguration',
            fields=[
                ('key', models.CharField(max_length=50, primary_key=True, serialize=False, unique=True, verbose_name='설정 키')),
                ('value', models.CharField(max_length=255, verbose_name='설정 값')),
            ],
        ),
    ]
