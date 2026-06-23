import sys
sys.stdout.reconfigure(encoding='utf-8')

from docx import Document

doc = Document('document/vc_can_lam.docx')
first_table = doc.tables[0]

for i, row in enumerate(first_table.rows):
    if i >= 3: break
    print(f'=== Row {i} ===')
    for j, cell in enumerate(row.cells):
        tc = cell._tc
        tc_pr = tc.find('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}tcPr')
        gs = None
        vm = None
        if tc_pr is not None:
            gs_el = tc_pr.find('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}gridSpan')
            if gs_el is not None:
                gs = gs_el.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}val')
            vm_el = tc_pr.find('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}vMerge')
            if vm_el is not None:
                vm = vm_el.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}val', 'continue')
        text = cell.text.strip()[:60]
        print(f'  Cell[{j}]: text="{text}" gridSpan={gs} vMerge={vm}')
    print()
