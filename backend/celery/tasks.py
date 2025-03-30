from celery import shared_task
import time
from backend.celery.celery_factory import celery
from backend.models import Users, ServiceRequests, ServiceProfessionals, Roles, RoleMap
from celery.schedules import crontab
import logging
import smtplib
from jinja2 import Template
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import csv


def send_mail(email, subject, email_content):
   smtp_server_host = "localhost"
   smtp_port = 1025
   sender_email = "admin.com"
   sender_password = ""

   msg = MIMEMultipart()
   msg["From"] = sender_email
   msg["To"] = email
   msg["Subject"] = subject

    
   msg.attach(MIMEText(email_content, "html"))


# Set up email server
   server = smtplib.SMTP(host=smtp_server_host,port=smtp_port)

   server.login(sender_email, sender_password)
   server.send_message(msg)
   server.quit()
   print("Email sent successfully.")



def get_html_report(username):
    with open("backend/celery/report.html", "r") as file:
        jinja_template = Template(file.read())
        html_report = jinja_template.render(username=username)

        return html_report

@celery.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    # Calls test('hello') every 10 seconds.
    sender.add_periodic_task(10.0, monthly_report.s(), name='report at every 10 for test')

   
    sender.add_periodic_task(10.0, daily_reminder.s(), name='daily_reminder')

    
    
    sender.add_periodic_task(
        crontab(hour=18, minute=30),
        daily_reminder.s(),
        name='daily_reminder at 6.30PM'
    )



@celery.task
def daily_reminder():
    print("Daily reminder task started.")
    # prof = User.query.filter_by(role="professional").all()
    # professional = User.query.join(Role, UserRoles).filter(Role.name == "Service Professional").all()
    professional = Users.query.all()
    for prof in professional:
        msg = f'<h1> Hi {prof.id}!! Please visit your service request.</h1>'
        send_mail(email=prof.email_id, email_content=msg, subject="Daily Reminder")
        print("reminder done")


@celery.task
def monthly_report():

    cust = Users.query.all()
    for c in cust:
        html_report = get_html_report(username=c.id)
        send_mail(email=c.email_id, email_content=html_report, subject="Monthly Report")
        print('Report sent')

@celery.task
def data_export(service_requests, email):
    print(email)
    with open('service_requests.csv', 'w', newline='') as csvfile:
        fieldnames = ['id', 'service_id', 'customer_id', 'service_professional_id', 'service_status',
                      'rating', 'feedback']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        
        # Use writer.writerows() to write a list of dictionaries
        writer.writerows(service_requests)

    return "Data Exported"