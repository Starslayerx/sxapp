from django.shortcuts import render
from django.http import HttpResponse

# Create your views here.
def index(request):
    line1 = '<h1 style="text-align: center">My First Page</h1>'
    line2 = '<image src="https://1024-imgs.stor.sinaapp.com/game/20160818/14715146191645573358" width=1500>'
    line3 = '<hr>'
    line4 = '<a href="/play/"> 进入游戏界面 </a>'
    return HttpResponse(line1 + line4 + line3 + line2)

def play(request):
    line1 = '<h1 style="text-align:center"> 游戏界面 </h1>'
    line2 = '<a href="/"> 返回主页面 </a>'
    return HttpResponse(line1 + line2)

