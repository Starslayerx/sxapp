# 申请授权码
from django.http import JsonResponse
from urllib.parse import quote
from random import randint
from django.core.cache import cache

def get_state():
    res = ""
    for i in range(8):
        res += str(randint(0, 9))
    return res


def apply_code(requset):
    client_id = "8ab685c6dd62ad0a67fb" # appid
    redirect_url = quote("https://app6532.acapp.acwing.com.cn/settings/github/web/receive_code/")
    scope = "userinfo"
    state = get_state()

    cache.set(state, True, 2*60*60) # 保存到redis, 有效期2h

    apply_code_url = "https://github.com/login/oauth/authorize"
    return JsonResponse({
        'result': "success",
        'apply_code_url': apply_code_url + "?client_id=%s&redirect=%s&scope=%s&state=%s" % (client_id, redirect_url, scope, state)
    })
