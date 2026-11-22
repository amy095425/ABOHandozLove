#!/bin/zsh
cd -- "${0:A:h}"
python3 scripts/install_preview.py || { read -r '?启动失败，按回车关闭'; exit 1; }
open 'http://127.0.0.1:8000/'
