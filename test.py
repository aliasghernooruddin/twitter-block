import hashlib
import hmac
import urllib.parse
from random import getrandbits

class OAuthSignature():

    url = ""

    secrets = {
        'consumer_secret': "",
        'token_secret': ""
    }

    def generate(self, params):
        """
        Generate Twitter signature
        """

        params_str = '&'.join(
            [('%s=%s' % (self.encode(str(k)), self.encode(str(params[k])))) for k in sorted(params)])


        message = "&".join(
            [self.encode("GET"), self.encode(self.url), self.encode(params_str)])


        cSecret = self.encode(self.secrets.get('consumer_secret'))

        tSecret = self.encode(self.secrets.get('token_secret'))

        key = "%s&%s" % (cSecret, tSecret)

        signature = hmac.new(key, message, hashlib.sha1).digest()

        digestBase64 = signature.encode("base64").rstrip('\n')

        return digestBase64

    def nonce(self):
        """ Generate random nonce value"""
        return str(getrandbits(64))

    def encode(self, text):
        return urllib.parse.quote(str(text), "")
