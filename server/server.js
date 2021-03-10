const axios = require('axios');
const crypto = require("crypto-js");
var cors = require('cors')

const express = require('express')
const app = express()
app.use(cors())
app.use(express.json());


const port = 3000


function getSignature(credentials, method, params, url) {

    function toArray(object) {
        let array = [];
        Object.keys(object).forEach(key => {
            array.push(`${key}=${object[key]}`);
        });
        return array

    }

    const oauth_consumer_key = 'oauth_consumer_key';
    const oauth_consumer_secret = 'oauth_consumer_secret';
    const oauth_token = credentials['token'];
    const oauth_secret = credentials['secret'];
    const oauth_signing_key = `${oauth_consumer_secret}&${oauth_secret}`;


    const oauth_parameter_string_object = {};
    oauth_parameter_string_object.oauth_consumer_key = oauth_consumer_key;
    oauth_parameter_string_object.oauth_token = oauth_token;
    const oauth_nonce_array = crypto.enc.Utf8.parse(randomString());
    oauth_parameter_string_object.oauth_nonce = encodeURIComponent(crypto.enc.Base64.stringify(oauth_nonce_array));
    oauth_parameter_string_object.oauth_signature_method = 'HMAC-SHA1';
    oauth_parameter_string_object.oauth_version = '1.0';
    oauth_parameter_string_object.oauth_timestamp = Math.round((new Date()).getTime() / 1000);

    // for Authorization request header (copy object)
    const oauth_authorization_header_object = Object.assign({}, oauth_parameter_string_object);

    // convert query string into object (+ encode)
    const url_query_string_object = {};

    const url_query_string_object_array = params

    url_query_string_object_array.forEach(item => {
        url_query_string_object[item.key] = encodeURIComponent(item.value);
    });

    // merge query parameter
    Object.assign(oauth_parameter_string_object, url_query_string_object);

    // sort object by key
    const oauth_parameter_string_object_ordered = {};
    Object.keys(oauth_parameter_string_object).sort().forEach(function(key) {
        oauth_parameter_string_object_ordered[key] = oauth_parameter_string_object[key];
    });

    // generate parameter string
    const oauth_parameter_string = toArray(oauth_parameter_string_object_ordered).join('&');

    base_host = url

    // generate base string
    const oauth_base_string = `${method}&${encodeURIComponent(base_host)}&${encodeURIComponent(oauth_parameter_string)}`;

    // generate signature
    const oauth_signature = crypto.enc.Base64.stringify(crypto.HmacSHA1(oauth_base_string, oauth_signing_key));

    oauth_authorization_header_object.oauth_signature = encodeURIComponent(oauth_signature);

    // generate Authorization header string
    const oauth_authorization_header = toArray(oauth_authorization_header_object).join(', ');
    let authorization = 'OAuth ' + oauth_authorization_header
    return authorization

}

function randomString() {
    const random_source = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let oauth_nonce = '';
    for (let i = 0; i < 32; i++) {
        oauth_nonce += random_source.charAt(Math.floor(Math.random() * random_source.length));
    }
    return oauth_nonce
}


app.post('/get-blocked-users', (req, res) => {

    let credentials = req.body

    const instance = axios.create({
        baseURL: 'https://api.twitter.com/1.1/blocks/',
        timeout: 1000,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': getSignature(credentials, 'GET', [], 'https://api.twitter.com/1.1/blocks/list.json')
        }
    });

    instance.get('list.json').then(data => {
        res.send(data.data)
    }).catch(err => {
        console.log(err.message);
        res.send(err.message)
    })
})

app.post('/block-user', (req, res) => {

    let credentials = req.body

    const instance2 = axios.create({
        baseURL: 'https://api.twitter.com/1.1/blocks/',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': getSignature(credentials, 'POST', [{ key: 'screen_name', value: credentials['screen_name'] }], 'https://api.twitter.com/1.1/blocks/create.json')
        }
    });

    instance2.post('create.json?screen_name=' + credentials['screen_name']).then(data => {
        res.send({ status: true })
    }).catch(err => {
        console.log("Error: " + err.message);
        res.send({
            status: false,
            error: err.message
        })
    })
})

app.post('/unblock-user', (req, res) => {

    let credentials = req.body

    const instance3 = axios.create({
        baseURL: 'https://api.twitter.com/1.1/blocks/',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': getSignature(credentials, 'POST', [{ key: 'screen_name', value: credentials['screen_name'] }], 'https://api.twitter.com/1.1/blocks/destroy.json')
        }
    });

    instance3.post('destroy.json?screen_name=' + credentials['screen_name']).then(data => {
        res.send({ status: true })
    }).catch(err => {
        console.log("Error: " + err.message);
        res.send({
            status: false,
            error: err.message
        })
    })
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
