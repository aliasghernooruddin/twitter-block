import os
import sys
import unittest
import time
import json
from urllib.request import urlopen, Request
from urllib.parse import urlencode


sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from signature import OAuthSignature

class SignatureGenerateTests(unittest.TestCase):

    def testTwitterRequest(self):
        """Get a twitter record"""
        oauthCtrl = OAuthSignature()
        oauthCtrl.url = "https://api.twitter.com/1.1/blocks/ids.json"
        oauthCtrl.secrets = {
            'consumer_secret': "S9RMiQKnpprv5KTHIOkOcU5hv",
            'token_secret': '875362759-LLzxGOrEhjeFteR5iBt2qbXOFK6Yy7UKqyL9YZYU'
        }


        # params for signature
        params = {
            'oauth_version': '1.0',
            'oauth_consumer_key': "S9RMiQKnpprv5KTHIOkOcU5hv",
            'oauth_token': "875362759-LLzxGOrEhjeFteR5iBt2qbXOFK6Yy7UKqyL9YZYU",
            'oauth_timestamp': int(time.time()),
            'oauth_signature_method': 'HMAC-SHA1',
            'oauth_nonce': oauthCtrl.nonce()
        }
        # generate signature
        params['oauth_signature'] = oauthCtrl.generate(params)

        # convert params to string for Authorization header
        params_str = ", ".join(['%s="%s"' % (k, oauthCtrl.encode(params[k])) for k in sorted(params)])

        headers = { 'authorization': "OAuth " + params_str}
        print(headers)

        # add request object params
        req = Request(oauthCtrl.url , headers=headers)

        # make request
        response = urlopen(req)

        # response -> json
        result = json.loads(response.read())
        print(result)

        self.assertTrue(len(result) > 0)

if __name__ == '__main__':
    unittest.main()
