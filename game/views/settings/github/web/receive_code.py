# 授权后接收code
from django.shortcuts import redirect
from django.core.cache import cache
from urllib.parse import parse_qs
from django.contrib.auth.models import User
from game.models.player.player import Player
from django.contrib.auth import login
from random import randint
import requests

# 获取用户信息
def get_user_info(access_token):
    base_url = 'https://api.github.com/'
    endpoint = 'user'

    headers = {
        'Authorization': f'token {access_token}',
        'Accept': 'application/vnd.github.v3+json'
    }

    response = requests.get(base_url + endpoint, headers=headers)

    if response.status_code == 200:
        return response.json()
    else:
        return {} # 若失败则返回空字典

def receive_code(request):
    data = request.GET
    code = data.get('code')
    state = data.get('state')

    if not cache.has_key(state):
        return redirect("index")

    cache.delete(state)

    access_token_url = "https://github.com/login/oauth/access_token"
    user_data = {
            'client_id': "8ab685c6dd62ad0a67fb",
            'client_secret': "a0c297ed0ab350d133f85a7675e04cdbf7cbc89f",
            'code': code
    }

    # 处理数据
    access_token_res = requests.post(access_token_url, data=user_data)
    response_data = parse_qs(access_token_res.text)
    cleaned_response_data = {key: value[0] for key, value in response_data.items()}

    # 获取access_token token_type
    access_token = cleaned_response_data['access_token']
    token_type = cleaned_response_data['token_type']

    # 获取用户信息
    user_info = get_user_info(access_token)
    username = user_info.get('login')
    openid = user_info.get('id')
    photo = user_info.get('avatar_url')

    # 如果该用户注册过，则无需重新获取信息，直接登陆
    players = Player.objects.filter(openid=openid)
    if players.exists():
        login(request, players[0].user)
        return redirect("index")

    # 如果用户名已存在，则在用户名后面添加随机数字，直到用户名不存在
    while User.objects.filter(username=username).exists():
        username += str(randint(0, 9))
    # 用户不存在，注册该用户
    user = User.objects.create(username=username)
    player = Player.objects.create(user=user, photo=photo, openid=openid)

    login(request, user)

    return redirect("index")
