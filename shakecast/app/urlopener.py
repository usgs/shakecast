try:
    import urllib.request, urllib.error, urllib.parse
except:
    import urllib.request as urllib2
import ssl

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
            if ctx is not None:
                url_obj = urllib.request.urlopen(url, timeout=60, context=ctx)
            else:
                url_obj = urllib.request.urlopen(url, timeout=60)
                    
            url_read = url_obj.read()
            url_obj.close()

        except Exception as e:
            raise Exception('URLOpener Error({}: {}, url: {})'.format(type(e),
                                                             e,
                                                             url))

        return url_read