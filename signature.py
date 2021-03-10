import unittest
import time
import json
from urllib.request import urlopen,Request
import urllib.parse
from test import OAuthSignature

class SignatureGenerateTests(unittest.TestCase):

    def testEncode(self):
        oauthCtrl = OAuthSignature()
        self.assertNotEqual(oauthCtrl.encode("from:twitter #auth"), 'from%3Atwitter+%23auth')

    def testSignatureGenerate(self):
        oauthCtrl = OAuthSignature()
        oauthCtrl.url = "https://api.twitter.com/1.1/statuses/user_timeline.json"
        oauthCtrl.secrets = {
            'consumer_secret': "1234567890",
            'token_secret': '0987654321'
        }

        params = {
            'oauth_version': '1.0',
            'oauth_consumer_key': "c_key",
            'oauth_token': "t_key",
            'oauth_timestamp': int(time.time()),
            'oauth_signature_method': 'HMAC-SHA1',
            'oauth_nonce': oauthCtrl.nonce()
        }

        self.assertEqual(len(oauthCtrl.generate(params)), 28)

    def testDistinctionSignatures(self):
        oauthCtrl = OAuthSignature()
        oauthCtrl.url = "https://api.twitter.com/1.1/statuses/user_timeline.json"
        oauthCtrl.secrets = {
            'consumer_secret': "1234567890",
            'token_secret': '0987654321'
        }

        params1 = {
            'oauth_version': '1.0',
            'oauth_consumer_key': "c_key",
            'oauth_token': "t_key",
            'oauth_timestamp': int(time.time()),
            'oauth_signature_method': 'HMAC-SHA1',
            'oauth_nonce': oauthCtrl.nonce()
        }

        params2 = {
            'oauth_version': '1.0',
            'oauth_consumer_key': "c_key",
            'oauth_token': "t_key",
            'oauth_timestamp': int(time.time()),
            'oauth_signature_method': 'HMAC-SHA1',
            'oauth_nonce': oauthCtrl.nonce()
        }

        self.assertNotEqual(oauthCtrl.generate(params1), oauthCtrl.generate(params2))

    def testTwitterRequest(self):
        oauthCtrl = OAuthSignature()
        oauthCtrl.url = "https://api.twitter.com/1.1/statuses/home_timeline.json"
        oauthCtrl.secrets = {
            'consumer_secret': "0nMNtqbri3anjTGVM4UPoEQKmqgXpcRt2uc5GjlTs5kyMdimOQ",
            'token_secret': 'HzOrusShqLOb8OgFVZfFHsK8sBUJtIvFeN85QnHP5sYUA'
        }

        urlParams = {
            'count': 1,
            'exclude_replies': 1
        }

        params = {
            'oauth_version': '1.0',
            'oauth_consumer_key': "2XprLAUy4446K5loUZOidUBiI",
            'oauth_token': "2976071722-oCdfLOewykFaupdrOTacf0n947XGZ3yU5Q2BB1s",
            'oauth_timestamp': int(time.time()),
            'oauth_signature_method': 'HMAC-SHA1',
            'oauth_nonce': oauthCtrl.nonce()
        }

        params.update(urlParams)

        params['oauth_signature'] = oauthCtrl.generate(params)

        params_str = ",".join(['%s="%s"' % (k, oauthCtrl.encode(params[k])) for k in sorted(params)])

        headers = {
            'Authorization': 'OAuth realm="%s", %s ' % (oauthCtrl.url, params_str)
        }

        fullURL = oauthCtrl.url + "?" + urllib.parse.urlencode(urlParams)

        # add request object params
        req = Request(fullURL, headers=headers)

        # make request

        response = urlopen(req)

        # response -> json
        result = json.loads(response.read())

        self.assertTrue(len(result) > 0)

if __name__ == '__main__':
    unittest.main()
