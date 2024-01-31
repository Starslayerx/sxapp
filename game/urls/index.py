from django.urls import path, include
from game.views.index import index

urlpatterns = [
    path("", index, name="index"),
    path("menu/", include("game.urls.menu.index")),
    path("playground/", incldue("game.urls.playground.index")),
    path("settings/", incldue("game.urls.settings.index")),
]
