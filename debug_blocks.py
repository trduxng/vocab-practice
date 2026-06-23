import sys
sys.stdout.reconfigure(encoding='utf-8')

from docx import Document
from docx.oxml.table import CT_Tbl
from docx.text.paragraph import Paragraph
from docx.table import Table

doc = Document('document/vc_can_lam.docx')

body = doc.element.body
for i, child in enumerate(body):
    tag = child.tag.split('}')[-1] if '}' in child.tag else child.tag
    if tag == 'p':
        para = Paragraph(child, doc)
        text = para.text.strip()
        if text:
            print(f'[{i}] PARA: "{text[:80]}" style={para.style.name} bold={all(r.bold for r in para.runs if r.text.strip())}')
    elif tag == 'tbl':
        print(f'[{i}] TABLE')
    if i > 20: break
