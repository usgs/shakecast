from functools import wraps
from flask import redirect
from flask_login import current_user

# wrapper for admin only URLs
def admin_only(func):
    @wraps(func)
    def func_wrapper(*args, **kwargs):
        if current_user and current_user.is_authenticated:
            if current_user.user_type.lower() == 'admin':
                return func(*args, **kwargs)
            else:
                return redirect('/')
        else:
            return redirect('/')
    return func_wrapper
