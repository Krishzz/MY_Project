from django.shortcuts import render,redirect
from django.views.decorators.csrf import csrf_exempt
import json,random
from json import loads
from django.http import JsonResponse
import django.core.exceptions
import MySQLdb,hashlib,time
import datetime,calendar
from datetime import date
from datetime import timedelta,date

def logout_hr(request):
	try:
		del request.session['hr_leave']
	except:
		pass
	return render (request,'login_hr.html')

def hr_dashboard(request):
	db = MySQLdb.connect(user='spkNetUser', db='spk_production', passwd='pr0jSpKF0reVER', host='spksql')
	cursor = db.cursor()
	today  = datetime.datetime.today()
	today = today.strftime('%Y-%m-%d')
	hr = request.session.get('hr_leave')
	sts = request.POST.get('sts')
	dft = request.POST.get('Dft')
	emp_no = request.POST.get('emp_nam')
	cursor.execute('SELECT employee_no,fullname from users where current_employee = "1" and studiokey = "3" order by fullname; ')
	emp_name = cursor.fetchall()
	if hr:
		cursor.execute('SELECT username from users where fullname = "{}";'.format(hr))
		Usrname = cursor.fetchone()
		m = datetime.datetime.now().month
		y = datetime.datetime.now().year
		mon_len = calendar.monthlen(y,m)
		if dft == "0":
			start_date = today.strftime('%Y-%m-%d')
			end_date = start_date
		elif dft == "1":
			start_date = today-timedelta(days = 1)
			start_date = start_date.strftime('%Y-%m-%d')
			end_date = start_date
		elif dft == "2":
			base_date=datetime.date.today()
			monday = base_date - timedelta(days=base_date.isoweekday() - 1)
			week_dates = [monday + timedelta(days=i) for i in range(7)]
			start_date = week_dates[0].strftime('%Y-%m-%d')
			end_date = week_dates[-1].strftime('%Y-%m-%d')
		elif dft == "3":
			start_date = datetime.date(y,m,1)
			end_date = datetime.date(y,m,mon_len)
		elif dft == "4":
			start_date = datetime.date(y,1,1)
			end_date = datetime.date(y,12,31)
		if(dft == "all" or dft == None) and (sts == "all" or sts == None):
			print(dft,sts)
			if emp_no == "all" or emp_no == None:
				get = """SELECT leave_applications.leave_id,leave_applications.employee_no,users.fullname,leave_applications.no_of_days,
				DATE_FORMAT(leave_applications.date_from,"%d-%m-%Y"),DATE_FORMAT(leave_applications.date_to,"%d-%m-%Y"),leave_applications.type_of_leave,
				leave_applications.reason,leave_applications.status,
				leave_applications.impact_points,leave_applications.remarks,leave_ledger.taken_earned_leaves,leave_ledger.applied_earned_leaves,
				(leave_ledger.balance_earned_leaves-leave_ledger.applied_earned_leaves) as balance_earned_leaves,leave_ledger.taken_sick_leaves,
				leave_ledger.applied_sick_leaves,(leave_ledger.balance_sick_leaves-leave_ledger.applied_sick_leaves) as balance_sick_leaves, 
				leave_ledger.applied_casual_leaves,(leave_ledger.balance_casual_leaves-leave_ledger.applied_casual_leaves) as balance_casual_leaves,
				leave_ledger.taken_casual_leaves,
				DATE_FORMAT(leave_applications.date_from,"%Y-%m-%d"),DATE_FORMAT(leave_applications.date_to,"%Y-%m-%d")
				from leave_applications
				inner join users on users.employee_no  = leave_applications.employee_no inner join leave_ledger on leave_ledger.employee_no = leave_applications.employee_no
				where leave_applications.reporting_person = "{}" order by applied_date desc; """.format(Usrname[0])
				
			else:
				print('else')
				get = """SELECT leave_applications.leave_id,leave_applications.employee_no,users.fullname,leave_applications.no_of_days,
				DATE_FORMAT(leave_applications.date_from,"%d-%m-%Y"),DATE_FORMAT(leave_applications.date_to,"%d-%m-%Y"),leave_applications.type_of_leave,
				leave_applications.reason,leave_applications.status,
				leave_applications.impact_points,leave_applications.remarks,leave_ledger.taken_earned_leaves,leave_ledger.applied_earned_leaves,
				(leave_ledger.balance_earned_leaves-leave_ledger.applied_earned_leaves) as balance_earned_leaves,leave_ledger.taken_sick_leaves,
				leave_ledger.applied_sick_leaves,(leave_ledger.balance_sick_leaves-leave_ledger.applied_sick_leaves) as balance_sick_leaves, 
				leave_ledger.applied_casual_leaves,(leave_ledger.balance_casual_leaves-leave_ledger.applied_casual_leaves) as balance_casual_leaves,
				leave_ledger.taken_casual_leaves,
				DATE_FORMAT(leave_applications.date_from,"%Y-%m-%d"),DATE_FORMAT(leave_applications.date_to,"%Y-%m-%d")
				from leave_applications
				inner join users on users.employee_no  = leave_applications.employee_no inner join leave_ledger on leave_ledger.employee_no = leave_applications.employee_no
				where leave_applications.reporting_person = "{}" and leave_applications.employee_no = "{}" order by applied_date desc; """.format(Usrname[0],emp_no)
				
		elif sts != "all" and dft == "all":
			if emp_no !="all":
				get = """SELECT leave_applications.leave_id,leave_applications.employee_no,users.fullname,leave_applications.no_of_days,
				DATE_FORMAT(leave_applications.date_from,"%d-%m-%Y"),DATE_FORMAT(leave_applications.date_to,"%d-%m-%Y"),leave_applications.type_of_leave,
				leave_applications.reason,leave_applications.status,
				leave_applications.impact_points,leave_applications.remarks,leave_ledger.taken_earned_leaves,leave_ledger.applied_earned_leaves,
				(leave_ledger.balance_earned_leaves-leave_ledger.applied_earned_leaves) as balance_earned_leaves,leave_ledger.taken_sick_leaves,
				leave_ledger.applied_sick_leaves,(leave_ledger.balance_sick_leaves-leave_ledger.applied_sick_leaves) as balance_sick_leaves, 
				leave_ledger.applied_casual_leaves,(leave_ledger.balance_casual_leaves-leave_ledger.applied_casual_leaves) as balance_casual_leaves,
				leave_ledger.taken_casual_leaves,
				DATE_FORMAT(leave_applications.date_from,"%Y-%m-%d"),DATE_FORMAT(leave_applications.date_to,"%Y-%m-%d")
				from leave_applications inner join users on users.employee_no  = leave_applications.employee_no 
				inner join leave_ledger on leave_ledger.employee_no = leave_applications.employee_no
				where leave_applications.reporting_person = "{}" and leave_applications.status = "{}" 
				and leave_applications.employee_no = "{}" order by applied_date desc; """.format(Usrname[0],sts,emp_no)
			else:
				get = """SELECT leave_applications.leave_id,leave_applications.employee_no,users.fullname,leave_applications.no_of_days,
				DATE_FORMAT(leave_applications.date_from,"%d-%m-%Y"),DATE_FORMAT(leave_applications.date_to,"%d-%m-%Y"),leave_applications.type_of_leave,
				leave_applications.reason,leave_applications.status,
				leave_applications.impact_points,leave_applications.remarks,leave_ledger.taken_earned_leaves,leave_ledger.applied_earned_leaves,
				(leave_ledger.balance_earned_leaves-leave_ledger.applied_earned_leaves) as balance_earned_leaves,leave_ledger.taken_sick_leaves,
				leave_ledger.applied_sick_leaves,(leave_ledger.balance_sick_leaves-leave_ledger.applied_sick_leaves) as balance_sick_leaves, 
				leave_ledger.applied_casual_leaves,(leave_ledger.balance_casual_leaves-leave_ledger.applied_casual_leaves) as balance_casual_leaves,
				leave_ledger.taken_casual_leaves,
				DATE_FORMAT(leave_applications.date_from,"%Y-%m-%d"),DATE_FORMAT(leave_applications.date_to,"%Y-%m-%d")
				from leave_applications inner join users on users.employee_no  = leave_applications.employee_no 
				inner join leave_ledger on leave_ledger.employee_no = leave_applications.employee_no
				where leave_applications.reporting_person = "{}" and leave_applications.status = "{}" order by applied_date desc; """.format(Usrname[0],sts)
		elif sts == "all" and dft != "all":
			if emp_no != "all":
				get = """SELECT leave_applications.leave_id,leave_applications.employee_no,users.fullname,leave_applications.no_of_days,
				DATE_FORMAT(leave_applications.date_from,"%d-%m-%Y"),DATE_FORMAT(leave_applications.date_to,"%d-%m-%Y"),leave_applications.type_of_leave,
				leave_applications.reason,leave_applications.status,
				leave_applications.impact_points,leave_applications.remarks,leave_ledger.taken_earned_leaves,leave_ledger.applied_earned_leaves,
				(leave_ledger.balance_earned_leaves-leave_ledger.applied_earned_leaves) as balance_earned_leaves,leave_ledger.taken_sick_leaves,
				leave_ledger.applied_sick_leaves,(leave_ledger.balance_sick_leaves-leave_ledger.applied_sick_leaves) as balance_sick_leaves, 
				leave_ledger.applied_casual_leaves,(leave_ledger.balance_casual_leaves-leave_ledger.applied_casual_leaves) as balance_casual_leaves,
				leave_ledger.taken_casual_leaves,
				DATE_FORMAT(leave_applications.date_from,"%Y-%m-%d"),DATE_FORMAT(leave_applications.date_to,"%Y-%m-%d")
				from leave_applications inner join users on users.employee_no  = leave_applications.employee_no 
				inner join leave_ledger on leave_ledger.employee_no = leave_applications.employee_no
				where leave_applications.reporting_person = "{}" and leave_applications.date_from between "{}" and "{}"
				and leave_applications.employee_no = "{}"
				order by applied_date desc; """.format(Usrname[0],start_date,end_date,emp_no)
			else:
				get = """SELECT leave_applications.leave_id,leave_applications.employee_no,users.fullname,leave_applications.no_of_days,
				DATE_FORMAT(leave_applications.date_from,"%d-%m-%Y"),DATE_FORMAT(leave_applications.date_to,"%d-%m-%Y"),leave_applications.type_of_leave,
				leave_applications.reason,leave_applications.status,
				leave_applications.impact_points,leave_applications.remarks,leave_ledger.taken_earned_leaves,leave_ledger.applied_earned_leaves,
				(leave_ledger.balance_earned_leaves-leave_ledger.applied_earned_leaves) as balance_earned_leaves,leave_ledger.taken_sick_leaves,
				leave_ledger.applied_sick_leaves,(leave_ledger.balance_sick_leaves-leave_ledger.applied_sick_leaves) as balance_sick_leaves, 
				leave_ledger.applied_casual_leaves,(leave_ledger.balance_casual_leaves-leave_ledger.applied_casual_leaves) as balance_casual_leaves,
				leave_ledger.taken_casual_leaves,
				DATE_FORMAT(leave_applications.date_from,"%Y-%m-%d"),DATE_FORMAT(leave_applications.date_to,"%Y-%m-%d")
				from leave_applications
				inner join users on users.employee_no  = leave_applications.employee_no inner join leave_ledger on leave_ledger.employee_no = leave_applications.employee_no
				where leave_applications.reporting_person = "{}" and leave_applications.date_from between "{}" and "{}"
				order by applied_date desc; """.format(Usrname[0],start_date,end_date)
		else:
			if emp_no != "all":
				get = """SELECT leave_applications.leave_id,leave_applications.employee_no,users.fullname,leave_applications.no_of_days,
				DATE_FORMAT(leave_applications.date_from,"%d-%m-%Y"),DATE_FORMAT(leave_applications.date_to,"%d-%m-%Y"),leave_applications.type_of_leave,
				leave_applications.reason,leave_applications.status,
				leave_applications.impact_points,leave_applications.remarks,leave_ledger.taken_earned_leaves,leave_ledger.applied_earned_leaves,
				(leave_ledger.balance_earned_leaves-leave_ledger.applied_earned_leaves) as balance_earned_leaves,leave_ledger.taken_sick_leaves,
				leave_ledger.applied_sick_leaves,(leave_ledger.balance_sick_leaves-leave_ledger.applied_sick_leaves) as balance_sick_leaves, 
				leave_ledger.applied_casual_leaves,(leave_ledger.balance_casual_leaves-leave_ledger.applied_casual_leaves) as balance_casual_leaves,
				leave_ledger.taken_casual_leaves,
				DATE_FORMAT(leave_applications.date_from,"%Y-%m-%d"),DATE_FORMAT(leave_applications.date_to,"%Y-%m-%d")
				from leave_applications inner join users on users.employee_no  = leave_applications.employee_no 
				inner join leave_ledger on leave_ledger.employee_no = leave_applications.employee_no
				where leave_applications.reporting_person = "{}" and leave_applications.status = "{}" and leave_applications.date_from between "{}" and "{}"
				and leave_applications.employee_no = "{}"
				order by applied_date desc; """.format(Usrname[0],sts,start_date,end_date,emp_no)
			else:
				get = """SELECT leave_applications.leave_id,leave_applications.employee_no,users.fullname,leave_applications.no_of_days,
				DATE_FORMAT(leave_applications.date_from,"%d-%m-%Y"),DATE_FORMAT(leave_applications.date_to,"%d-%m-%Y"),leave_applications.type_of_leave,
				leave_applications.reason,leave_applications.status,
				leave_applications.impact_points,leave_applications.remarks,leave_ledger.taken_earned_leaves,leave_ledger.applied_earned_leaves,
				(leave_ledger.balance_earned_leaves-leave_ledger.applied_earned_leaves) as balance_earned_leaves,leave_ledger.taken_sick_leaves,
				leave_ledger.applied_sick_leaves,(leave_ledger.balance_sick_leaves-leave_ledger.applied_sick_leaves) as balance_sick_leaves, 
				leave_ledger.applied_casual_leaves,(leave_ledger.balance_casual_leaves-leave_ledger.applied_casual_leaves) as balance_casual_leaves,
				leave_ledger.taken_casual_leaves,
				DATE_FORMAT(leave_applications.date_from,"%Y-%m-%d"),DATE_FORMAT(leave_applications.date_to,"%Y-%m-%d")
				from leave_applications
				inner join users on users.employee_no  = leave_applications.employee_no inner join leave_ledger on leave_ledger.employee_no = leave_applications.employee_no
				where leave_applications.reporting_person = "{}" and leave_applications.status = "{}" and leave_applications.date_from between "{}" and "{}"
				order by applied_date desc; """.format(Usrname[0],sts,start_date,end_date)
		cursor.execute(get)
		leave_apps = cursor.fetchall()
		print(leave_apps)
		context = {
			'leave_app' : leave_apps,
			'today' : today,
			'emp_name' : emp_name,
		}
		return render(request,'hr_dashboard.html',context)
	else:
		Usrname = request.POST.get("Usrnme")
		Password = request.POST.get("Pswd")
		Admin = ["bharathi", "kannan.ms", "madhankrishna.p","ganesan.r"]
		if Usrname == "" or Usrname == None:
			return render(request, 'login_hr.html')
		elif Usrname in Admin:
			cursor.execute('SELECT UserName,Password,FullName,UserKey from users where UserName="{}"'.format(Usrname))
			a=cursor.fetchall()
			usercheck=a[0][0]
			passcheck=a[0][1]
			Fullnam=a[0][2]
			userkey=a[0][3]
			passw = hashlib.md5(Password.encode())
			passw = passw.hexdigest()
			if passw==passcheck:
				request.session['hr_leave'] = Fullnam
				print('first')
				get = """SELECT leave_applications.leave_id,leave_applications.employee_no,users.fullname,leave_applications.no_of_days,
				DATE_FORMAT(leave_applications.date_from,"%d-%m-%Y"),DATE_FORMAT(leave_applications.date_to,"%d-%m-%Y"),leave_applications.type_of_leave,
				leave_applications.reason,leave_applications.status,
				leave_applications.impact_points,leave_applications.remarks,leave_ledger.taken_earned_leaves,leave_ledger.applied_earned_leaves,
				(leave_ledger.balance_earned_leaves-leave_ledger.applied_earned_leaves) as balance_earned_leaves,leave_ledger.taken_sick_leaves,
				leave_ledger.applied_sick_leaves,(leave_ledger.balance_sick_leaves-leave_ledger.applied_sick_leaves) as balance_sick_leaves, 
				leave_ledger.applied_casual_leaves,(leave_ledger.balance_casual_leaves-leave_ledger.applied_casual_leaves) as balance_casual_leaves,
				leave_ledger.taken_casual_leaves,
				DATE_FORMAT(leave_applications.date_from,"%Y-%m-%d"),DATE_FORMAT(leave_applications.date_to,"%Y-%m-%d")
				from leave_applications
				inner join users on users.employee_no  = leave_applications.employee_no inner join leave_ledger on leave_ledger.employee_no = leave_applications.employee_no
				where leave_applications.reporting_person = "{}" order by applied_date desc; """.format(usercheck)
				
				cursor.execute(get)
				leave_apps = cursor.fetchall()

				context = {
					'leave_app' : leave_apps,
					'today' : today,
					'emp_name':emp_name,
				}

				return render(request,'hr_dashboard.html',context)
			else:
				msg1 = "Please enter valid Password"
				context = {
					'passw': msg1,
				}
				return render(request, 'login_hr.html', context)
		else:
			msg1 = "Access Denied, this is for authorized personel only"
			context = {
				'passw': msg1,
			}
			return render(request, 'login_hr.html', context)

def add_holidays(request):
	year = time.strftime("%Y")
	db = MySQLdb.connect(user='spkNetUser', db='spk_production', passwd='pr0jSpKF0reVER', host='spksql')
	cursor = db.cursor()
	cursor.execute('SELECT DATE_FORMAT(holiday_date,"%d-%m-%Y"), day_special,holiday_id from holidays where holiday_date between "{}-01-01" and  "{}-12-31"; '.format(year,year))
	a = cursor.fetchall()
	context = {
		'holidays' : a,
	}
	return render(request, 'add_holidays.html',context)

def add_filters(request,filter=None):
	db = MySQLdb.connect(user='spkNetUser', db='spk_production', passwd='pr0jSpKF0reVER', host='spksql')
	cursor = db.cursor()
	if filter == "Leave":
		cursor.execute('SELECT leave_type,type_id from leave_types')
		a = cursor.fetchall()
		context = {
			'Filters' : a,
		}
		return render(request, 'leave_filter.html',context)
	elif filter == "Status":
		cursor.execute('SELECT status,sts_id from status_filter')
		a = cursor.fetchall()
		context = {
			'Filters' : a,
		}
		return render(request, 'status_filter.html',context)

def edit_application(request):
	db = MySQLdb.connect(user='spkNetUser', db='spk_production', passwd='pr0jSpKF0reVER', host='spksql')
	cursor = db.cursor()
	if request.method == 'POST' and request.is_ajax():
		leave_application = json.loads(request.POST.get('edit_app',None))
		print(leave_application)
		id = leave_application['id']
		no_of_days = leave_application['no_of_days']
		frm_date = leave_application['frm_date']
		to_date = leave_application['to_date']
		leave_type = leave_application['leave_type']
		impact_points = leave_application['impact_points']
		app_leave = leave_application['app_leave']
		remarks = leave_application['remarks']
		sts = leave_application['sts']
		cursor.execute('SELECT employee_no from leave_applications where leave_id = "{}"'.format(id))
		a = cursor.fetchone()
		cursor.execute(""" UPDATE leave_applications SET no_of_days = "{}", date_from = "{}", date_to = "{}", type_of_leave = "{}", status = "{}", remarks = "{}", 
		impact_points = "{}" where leave_id = "{}" """.format(no_of_days,frm_date,to_date,leave_type, sts, remarks, impact_points,id))
		if leave_type == "Sick":
			cursor.execute(""" UPDATE leave_ledger SET applied_sick_leaves = "{}" where
			employee_no = "{}" """.format(app_leave,a[0]))
		elif leave_type == "Earned":
			cursor.execute(""" UPDATE leave_ledger SET applied_earned_leaves = "{}" where
			employee_no = "{}" """.format(app_leave,a[0]))
		elif leave_type == "Casual":
			cursor.execute(""" UPDATE leave_ledger SET applied_casual_leaves = "{}" where
			employee_no = "{}" """.format(app_leave,a[0]))
		db.commit()
		db.close()
		data ={
		'mydata' : 'data saved',
		}
	else:
		data = {}
	return JsonResponse(data)

def new_holidays(request):
	db = MySQLdb.connect(user='spkNetUser', db='spk_production', passwd='pr0jSpKF0reVER', host='spksql')
	cursor = db.cursor()
	if request.method == 'POST' and request.is_ajax():
		new_holidays = json.loads(request.POST.get('new_holidays',None))
		for x in new_holidays:
			holiday_date = x[0]
			holiday_day = x[1]
			print(holiday_date,holiday_day)
			cursor.execute("""INSERT INTO holidays(holiday_date,day_special) VALUES ("{}","{}") """.format(holiday_date,holiday_day))
		db.commit()
		db.close()
		data ={
		'mydata' : 'data saved',
		}
	else:
		data = {}
	return JsonResponse(data)

def new_filters(request):
	db = MySQLdb.connect(user='spkNetUser', db='spk_production', passwd='pr0jSpKF0reVER', host='spksql')
	cursor = db.cursor()
	if request.method == 'POST' and request.is_ajax():
		new_filters = json.loads(request.POST.get('new_filters',None))
		if new_filters['type'] == "Leave":
			for x in new_filters['name']:
				cursor.execute("""INSERT INTO leave_types(leave_type) VALUES ("{}") """.format(x))
		elif new_filters['type'] == "Status":
			for x in new_filters['name']:
				cursor.execute("""INSERT INTO status_filter(status) VALUES ("{}") """.format(x))
		db.commit()
		db.close()
		data ={
		'mydata' : 'data saved',
		}
	else:
		data = {}
	return JsonResponse(data)