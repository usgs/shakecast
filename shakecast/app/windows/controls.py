import server_service as server
import web_server_service as web_server

def start():
    server.command(['start'])
    web_server.command(['start'])

def install():
    server.command(['--startup=auto', 'install'])
    web_server.command(['--startup=auto', 'install'])

def stop():
    server.command(['stop'])
    web_server.command(['stop'])

def uninstall():
    server.command(['remove'])
    web_server.command(['remove'])