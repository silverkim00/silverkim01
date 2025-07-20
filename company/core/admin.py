from django.contrib import admin
from .models import ClientData, PerformanceRecord, Incentive, SiteConfiguration, EmployeeProfile

# Register your models here.
admin.site.register(ClientData)
admin.site.register(PerformanceRecord)
admin.site.register(Incentive) 
admin.site.register(SiteConfiguration) 
admin.site.register(EmployeeProfile) 