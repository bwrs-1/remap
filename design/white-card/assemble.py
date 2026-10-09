#!/usr/bin/env python3
# Assembles frags/Main.frag from frags/Main.src, frags/Main.js and the parts_*.html snippets.
import os
ROOT = os.path.dirname(os.path.abspath(__file__))
rd = lambda p: open(os.path.join(ROOT, p)).read().strip()
s = open(os.path.join(ROOT, 'frags', 'Main.src')).read()
for key, path in [('RIGHT', 'parts_right.html'), ('KEYWIN', 'parts_keywin.html'), ('KEYSPANES', 'parts_keyspanes.html'), ('DIALOGS', 'parts_dialogs.html'), ('JS', 'frags/Main.js')]:
    s = s.replace('%%' + key + '%%', rd(path))
open(os.path.join(ROOT, 'frags', 'Main.frag'), 'w').write(s)
print('assembled frags/Main.frag')
