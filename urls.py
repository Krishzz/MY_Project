from django.contrib import admin
from django.urls import path

from . import views
urlpatterns = [
	path('hr_dashboard/', views.hr_dashboard, name="hr_dashboard"),
	path('logout_hr/', views.logout_hr, name="logout_hr"),
	path('add_holidays/', views.add_holidays, name = 'add_holidays'),
	path('edit_application/', views.edit_application, name = 'edit_application'),
	path('add_filters/<str:filter>/', views.add_filters, name = 'add_filters'),
	path('new_holidays/', views.new_holidays, name="new_holidays"),
	path('new_filters/', views.new_filters, name="new_filters"),
]
