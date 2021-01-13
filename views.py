from django.shortcuts import render,redirect
from django.views.decorators.csrf import csrf_exempt
import json,random
from json import loads
from django.http import JsonResponse
import django.core.exceptions
import MySQLdb,hashlib
import datetime
from datetime import timedelta,date

def Emp_status(request):
	db = MySQLdb.connect(user='spkNetUser', db='spk_production', passwd='pr0jSpKF0reVER', host='spksql')
	cursor = db.cursor()
	Usrname = request.POST.get("Usrnme")
	Password = request.POST.get("Pswd")

	cursor.execute('SELECT UserName from users where UserName="{}"'.format(Usrname))
	data="error"
	for i in cursor:
		data=i
	if Usrname==None:
		db.close()
		return render(request,'Login.html')
	elif data=="error":
		msg="Please enter valid Username"
		context = {
		'usrnm':msg,
		}
		db.close()
		return render(request,'Login.html',context)
	else:
		cursor.execute('SELECT UserName,Password,FullName,UserKey from users where UserName="{}"'.format(Usrname))
		a=cursor.fetchall()
		usercheck=a[0][0]
		passcheck=a[0][1]
		Fullnam=a[0][2]
		userkey=a[0][3]
		passw = hashlib.md5(Password.encode())
		passw = passw.hexdigest()
		if passw==passcheck:
			#print(Fullnam)
			cursor.execute('SELECT Userkey from employee_workstatus where Userkey="{}"'.format(userkey))
			data="error"
			for i in cursor:
				data=i
			if data=="error":
				request.session['username'] = Fullnam
				request.session.set_expiry(86400)
				Userkey = userkey
				Username = Fullnam
				Status="Online"
				Stsmsg="Logged In"
				stsdate = datetime.date.today()
				ststime = datetime.datetime.now().time()
				stsflag=1
				cursor.execute('INSERT INTO employee_workstatus (Userkey,Username,Workstatus,Status_date,Statustime,Statusflag,Statusmessage) VALUES ({},"{}","{}","{}","{}","{}","{}");'.format(Userkey,Username,Status,stsdate,ststime,stsflag,Stsmsg))
				db.commit()
				query = 'SELECT Userkey,UserName,Workstatus,Statusmessage from employee_workstatus where UserKey="{}" order by Status_date desc, Statustime desc limit 1'.format(userkey)
				#print(query)
				cursor.execute(query)
				a=cursor.fetchall()
				Userkey=a[0][0]
				Username=a[0][1]
				if a[0][2]=="Online":
					Status1=a[0][2]
				Status2="Logged In for the Day"
				Stsmsg=a[0][3]
				context={
				'fullname':Username,
				'userkey':Userkey,
				'sts1':Status1,
				'sts2':Status2,
				'Stsmsg':Stsmsg,
				}
				db.close()
				return render(request,'emp_work_stats.html',context)
			else:
				request.session['username'] = Fullnam
				#print(Fullnam)
				request.session.set_expiry(86400)
				query = 'SELECT Workstatus,Status_date,userkey,username from employee_workstatus where UserKey="{}" order by Status_date desc, Statustime desc limit 1'.format(userkey)
				#print(query)
				cursor.execute(query)
				a=cursor.fetchall()
				Status = a[0][0]
				stsdate = a[0][1]
				Userkey = a[0][2]
				Username = a[0][3]
				sd = datetime.date.today()
				if Status!="Offline" and stsdate!=sd:
					ystday = stsdate
					print("Not the same")
					cursor.execute('INSERT INTO employee_workstatus (Userkey,Username,Workstatus,Status_date,Statustime,Statusflag,Statusmessage) VALUES ({},"{}","Offline","{}","23:59:00","0","Logged Out");'.format(Userkey,Username,ystday))
					db.commit()
					cursor.execute('INSERT INTO employee_workstatus (Userkey,Username,Workstatus,Status_date,Statustime,Statusflag,Statusmessage) VALUES ({},"{}","Online","{}","00:01:01","1","Logged In");'.format(Userkey,Username,sd))
					db.commit()
					query = 'SELECT Userkey,UserName,Workstatus,Statusmessage from employee_workstatus where UserKey="{}" order by Status_date desc, Statustime desc limit 1'.format(userkey)
					#print(query)
					cursor.execute(query)
					a=cursor.fetchall()
					Userkey=a[0][0]
					Username=a[0][1]
					Status=a[0][2]
					Stsmsg=a[0][3]
					context={
					'fullname':Username,
					'userkey':Userkey,
					'sts':Status,
					'Stsmsg':Stsmsg,
					}
					db.close()
					return render(request,'emp_work_stats.html',context)
				elif Status=="Offline":
					Userkey= userkey
					Username= Fullnam
					Status="Online"
					Stsmsg="Logged In"
					stsdate = datetime.date.today()
					ststime = datetime.datetime.now().time()
					stsflag = 1
					cursor.execute('INSERT INTO employee_workstatus (Userkey,Username,Workstatus,Status_date,Statustime,Statusflag,Statusmessage) VALUES ({},"{}","{}","{}","{}","{}","{}");'.format(Userkey,Username,Status,stsdate,ststime,stsflag,Stsmsg))
					db.commit()
					query = 'SELECT Userkey,UserName,Workstatus,Statusmessage from employee_workstatus where UserKey="{}" order by Status_date desc, Statustime desc limit 1'.format(userkey)
					#print(query)
					cursor.execute(query)
					a=cursor.fetchall()
					Userkey=a[0][0]
					Username=a[0][1]
					if a[0][2]=="Online":
						Status1=a[0][2]
					Status2="Logged In for the Day"
					Stsmsg=a[0][3]
					context={
					'fullname':Username,
					'userkey':Userkey,
					'sts1':Status1,
					'sts2':Status2,
					'Stsmsg':Stsmsg,
					}
					db.close()
					return render(request,'emp_work_stats.html',context)
				else:
					query = 'SELECT Userkey,UserName,Workstatus,Statusmessage from employee_workstatus where UserKey="{}" order by Status_date desc, Statustime desc limit 1'.format(userkey)
					#print(query)
					cursor.execute(query)
					a=cursor.fetchall()
					Userkey=a[0][0]
					Username=a[0][1]
					Status=a[0][2]
					Stsmsg=a[0][3]
					if a[0][2]=="Online":
						Status1=a[0][2]
						Status2="Logged In for the Day"
						Stsmsg=a[0][3]
						context={
						'fullname':Username,
						'userkey':Userkey,
						'sts1':Status1,
						'sts2':Status2,
						'Stsmsg':Stsmsg,
						}
						db.close()
						return render(request,'emp_work_stats.html',context)
					else:
						context={
						'fullname':Username,
						'userkey':Userkey,
						'sts':Status,
						'Stsmsg':Stsmsg,
						}
						db.close()
						return render(request,'emp_work_stats.html',context)
		else:
			msg1="Please enter valid Password"
			context = {
			'passw':msg1,
			}
			db.close()
			return render(request,'Login.html',context)

def status_update(request):
	db = MySQLdb.connect(user='spkNetUser', db='spk_production', passwd='pr0jSpKF0reVER', host='spksql')
	cursor = db.cursor()
	if request.method == 'POST' and request.is_ajax():
		Userkey = int(request.POST.get('Userkey',None))
		Username = str(request.POST.get('Username',None))
		Status = str(request.POST.get('Status',None))
		Stsmsg = str(request.POST.get('ststmsg',None))
	stsdate = datetime.date.today()
	ststime = datetime.datetime.now().time()
	#print(stsdate,ststime)
	if Status=="Online" or Status=="Resumed Work":
		stsflag=1
	else:
		stsflag=0
	stsflag = int(stsflag)
	query = 'SELECT Workstatus,Status_date,userkey,username from employee_workstatus where UserKey="{}" order by Status_date desc, Statustime desc limit 1'.format(userkey)
	#print(query)
	cursor.execute(query)
	a=cursor.fetchall()
	Statusn = a[0][0]
	stsdaten = a[0][1]
	Userkeyn = a[0][2]
	Usernamen = a[0][3]
	sd = datetime.date.today()
	if Statusn!="Offline" and stsdate!=sd:
		if Status == "Offline":
			ystday = stsdaten
			print("Not the same")
			cursor.execute('INSERT INTO employee_workstatus (Userkey,Username,Workstatus,Status_date,Statustime,Statusflag,Statusmessage) VALUES ({},"{}","Offline","{}","23:59:00","0","Logged Out");'.format(Userkey,Username,ystday))
			db.commit()
			cursor.execute('INSERT INTO employee_workstatus (Userkey,Username,Workstatus,Status_date,Statustime,Statusflag,Statusmessage) VALUES ({},"{}","Online","{}","00:01:01","1","Logged In");'.format(Userkey,Username,sd))
			db.commit()
			cursor.execute('INSERT INTO employee_workstatus (Userkey,Username,Workstatus,Status_date,Statustime,Statusflag,Statusmessage) VALUES ({},"{}","On a Break","{}","{}","0","On a Break");'.format(Userkey,Username,sd,ststime))
			db.commit()
		else:
			cursor.execute('INSERT INTO employee_workstatus (Userkey,Username,Workstatus,Status_date,Statustime,Statusflag,Statusmessage) VALUES ({},"{}","Offline","{}","23:59:00","0","Logged Out");'.format(Userkey,Username,ystday))
			db.commit()
			cursor.execute('INSERT INTO employee_workstatus (Userkey,Username,Workstatus,Status_date,Statustime,Statusflag,Statusmessage) VALUES ({},"{}","Online","{}","00:01:01","1","Logged In");'.format(Userkey,Username,sd))
			db.commit()
	
	else:
		print("Same")
		cursor.execute('INSERT INTO employee_workstatus (Userkey,Username,Workstatus,Status_date,Statustime,Statusflag,Statusmessage) VALUES ({},"{}","{}","{}","{}","{}","{}");'.format(Userkey,Username,Status,stsdate,ststime,stsflag,Stsmsg))
		db.commit()
		db.close()
	if Status == "Offline":
		#print("Offline")
		try:
			del request.session['username']
		except:
			pass
		data={
		'mydata':"redirect",
		}
		return JsonResponse(data)
	else:
		data={
		'mydata':"Status updated",
		}
		return JsonResponse(data)

