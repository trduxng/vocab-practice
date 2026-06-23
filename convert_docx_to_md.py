import sys
from lxml import etree
from docx import Document
from docx.oxml.table import CT_Tbl
from docx.oxml.text.paragraph import CT_P
from docx.table import Table
from docx.text.paragraph import Paragraph

W_NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'

def iter_block_items(doc):
    body = doc.element.body
    for child in body:
        if isinstance(child, CT_P):
            yield Paragraph(child, doc)
        elif isinstance(child, CT_Tbl):
            yield Table(child, doc)

def get_cell_text(tc):
    texts = []
    for p in tc.findall(f'.//{{{W_NS}}}p'):
        parts = []
        for r in p.findall(f'{{{W_NS}}}r'):
            t_el = r.find(f'{{{W_NS}}}t')
            if t_el is not None and t_el.text:
                parts.append(t_el.text)
        line = ''.join(parts).strip()
        if line:
            texts.append(line)
    return ' '.join(texts)

def table_to_md(table):
    tbl = table._tbl
    trs = tbl.findall(f'{{{W_NS}}}tr')

    tbl_grid = tbl.find(f'{{{W_NS}}}tblGrid')
    grid_cols = len(tbl_grid.findall(f'{{{W_NS}}}gridCol')) if tbl_grid is not None else 0

    rows = []
    for tr in trs:
        raw_cells = tr.findall(f'{{{W_NS}}}tc')
        cells = []
        for tc in raw_cells:
            tc_pr = tc.find(f'{{{W_NS}}}tcPr')
            span = 1
            if tc_pr is not None:
                gs_el = tc_pr.find(f'{{{W_NS}}}gridSpan')
                if gs_el is not None:
                    span = int(gs_el.get(f'{{{W_NS}}}val', 1))
            cell_text = get_cell_text(tc)
            cells.append(cell_text)
            # For gridSpan > 1, add empty placeholders
            for _ in range(span - 1):
                cells.append('')
        rows.append(cells)

    if not rows:
        return ''

    max_cols = max(len(r) for r in rows) if grid_cols == 0 else grid_cols
    for r in rows:
        while len(r) < max_cols:
            r.append('')

    # Trim trailing empty columns
    while max_cols > 0 and all(r[-1] == '' for r in rows):
        for r in rows:
            r.pop()
        max_cols -= 1

    lines = []
    header = rows[0]
    lines.append('| ' + ' | '.join(header) + ' |')
    lines.append('| ' + ' | '.join(['---'] * len(header)) + ' |')
    for row in rows[1:]:
        lines.append('| ' + ' | '.join(row) + ' |')

    return '\n'.join(lines)

def is_para_bold(para):
    """Check if a paragraph is bold."""
    text_runs = [r for r in para.runs if r.text.strip()]
    if not text_runs:
        return False
    return all(r.bold for r in text_runs)

def convert_docx_to_md(filepath):
    doc = Document(filepath)
    output = []

    for block in iter_block_items(doc):
        if isinstance(block, Paragraph):
            text = block.text.strip()
            style = block.style.name if block.style else ''

            if not text:
                output.append('')
                continue

            if style.startswith('Heading'):
                try:
                    level = int(style.replace('Heading ', ''))
                except:
                    level = 1
                level = min(level, 6)
                output.append(f'{"#" * level} {text}')
                output.append('')
                continue

            if is_para_bold(block):
                output.append(f'**{text}**')
            else:
                output.append(text)
            output.append('')

        elif isinstance(block, Table):
            md = table_to_md(block)
            if md:
                output.append('')
                output.append(md)
                output.append('')

    result = '\n'.join(output)
    while '\n\n\n' in result:
        result = result.replace('\n\n\n', '\n\n')
    return result.strip()

if __name__ == '__main__':
    input_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else input_file.replace('.docx', '.md')
    md = convert_docx_to_md(input_file)
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(md)
    print(f'Converted: {input_file} -> {output_file}')
