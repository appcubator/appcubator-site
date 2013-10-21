from appcubator.models import Customer, User

for c in Customer.objects.all():
    try:
        u = User.objects.get(email=c.email)
    except User.DoesNotExist:
        print "User not found for this customer"
        pass
    else:
        print "User found and fixed"
        c.sent_welcome_email = True
        c.user_id = u
        c.save()
