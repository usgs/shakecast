"""
This program holds all the non-database objects used necessary for
ShakeCast to run. These objects are used in the functions.py program
"""
try:
    import urllib2
except:
    import urllib.request as urllib2

import ssl
import json
import os
import sys
import time
import xml.etree.ElementTree as ET
from util import *
import socks
import types
from orm import Event, ShakeMap, Product, User, DeclarativeMeta, Group, SC, dbconnect
from notifications import NotificationBuilder, Mailer
modules_dir = os.path.join(sc_dir(), 'modules')
if modules_dir not in sys.path:
    sys.path += [modules_dir]

class URLOpener(object):
    """
    Either uses urllib2 standard opener to open a URL or returns an
    opener that can run through a proxy
    """
    
    @staticmethod
    def open(url):
        """
        Args:
            url (str): a string url that will be opened and read by urllib2
            
        Returns:
            str: the string read from the webpage
        """

        # create context to avoid certificate errors
        try:
            ctx = ssl.create_default_context()
            ctx.check_hostname = False
            ctx.verify_mode = ssl.CERT_NONE
        except:
            ctx = None

        try:
            sc = SC()
            if sc.use_proxy is True:
                if sc.proxy_username and sc.proxy_password:
                    proxy = urllib2.ProxyHandler({
                                'http': "http://{0}:{1}@{2}:{3}".format(sc.proxy_username,
                                                                        sc.proxy_password,
                                                                        sc.proxy_server,
                                                                        sc.proxy_port),
                                'https': "http://{0}:{1}@{2}:{3}".format(sc.proxy_username,
                                                                         sc.proxy_password,
                                                                         sc.proxy_server,
                                                                         sc.proxy_port)})
                    auth = urllib2.HTTPBasicAuthHandler()
                    opener = urllib2.build_opener(proxy, auth, urllib2.HTTPHandler)
                    
                    if ctx is not None:
                        url_obj = opener.open(url, timeout=60, context=ctx)
                    else:
                        url_obj = opener.open(url, timeout=60)

                    url_read = url_obj.read()
                    url_obj.close()
                    return url_read
                    
                else:
                    proxy = urllib2.ProxyHandler({'http': 'http://{0}:{1}'.format(sc.proxy_server,sc.proxy_port),
                                                  'https': 'https://{0}:{1}'.format(sc.proxy_server,sc.proxy_port)})
                    opener = urllib2.build_opener(proxy)
                    
                    if ctx is not None:
                        url_obj = opener.open(url, timeout=60, context=ctx)
                    else:
                        url_obj = opener.open(url, timeout=60)
                        
                    url_read = url_obj.read()
                    url_obj.close()
                    return url_read
    
            else:
                if ctx is not None:
                    url_obj = urllib2.urlopen(url, timeout=60, context=ctx)
                else:
                    url_obj = urllib2.urlopen(url, timeout=60)
                    
                url_read = url_obj.read()
                url_obj.close()
                return url_read
        except Exception as e:
            raise Exception('URLOpener Error({}: {}, url: {})'.format(type(e),
                                                             e,
                                                             url))

  
class AlchemyEncoder(json.JSONEncoder):
    '''
    Use as the JSON encoder when passing SQLAlchemy objects to the 
    web UI
    '''
    def default(self, obj):
        if isinstance(obj.__class__, DeclarativeMeta):
            # an SQLAlchemy class
            fields = {}
            for field in [x for x in dir(obj) if not x.startswith('_') 
                                and x != 'metadata' and x != '_sa_instance_state']:
                data = obj.__getattribute__(field)

                if isinstance(data, types.MethodType):
                    continue

                try:
                    json.dumps(data) # this will fail on non-encodable values, like other classes
                    fields[field] = data
                except TypeError:
                    try:
                        fields[field] = [str(d) for d in data]
                    except:
                        fields[field] = None
                except UnicodeEncodeError:
                    fields[field] = 'Non-encodable'
            # a json-encodable dict
            return fields
    
        return json.JSONEncoder.default(self, obj)
