const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const BACKEND = path.join(ROOT, 'backend', 'src');
const OUTPUT = path.join(__dirname, 'backend_pseudocode.json');
const parser = require(path.join(ROOT, 'frontend', 'node_modules', '@babel', 'parser'));

function walkFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    return entry.isDirectory() ? walkFiles(fullPath) : [fullPath];
  });
}

function compact(text) {
  return String(text || '')
    .replace(/\s+/g, ' ')
    .replace(/\s*\.\s*/g, '.')
    .replace(/\(\s*/g, '(')
    .replace(/\s*\)/g, ')')
    .replace(/\[\s*/g, '[')
    .replace(/\s*\]/g, ']')
    .replace(/\{\s*/g, '{ ')
    .replace(/\s*\}/g, ' }')
    .replace(/\s*,\s*/g, ', ')
    .replace(/\s*:\s*/g, ': ')
    .replace(/\s*;\s*/g, '; ')
    .replace(/\s+/g, ' ')
    .trim();
}

function trimText(text, maxLength = 180) {
  const normalized = compact(text);
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 3).trim()}...`;
}

function sourceOf(node, source) {
  if (!node || node.start == null || node.end == null) return '';
  return source.slice(node.start, node.end);
}

function summarizeSql(raw) {
  const sql = raw.replace(/\s+/g, ' ').trim();
  const operation = (sql.match(/\b(SELECT|INSERT|UPDATE|DELETE|MERGE|CREATE|ALTER|DROP|EXEC(?:UTE)?)\b/i) || [])[1];
  const tables = [];
  const patterns = [
    /\bFROM\s+(?:dbo\.)?([A-Za-z_][\w]*)/gi,
    /\bJOIN\s+(?:dbo\.)?([A-Za-z_][\w]*)/gi,
    /\bINTO\s+(?:dbo\.)?([A-Za-z_][\w]*)/gi,
    /\bUPDATE\s+(?:dbo\.)?([A-Za-z_][\w]*)/gi,
    /\bMERGE\s+(?:INTO\s+)?(?:dbo\.)?([A-Za-z_][\w]*)/gi,
  ];
  for (const pattern of patterns) {
    for (const match of sql.matchAll(pattern)) {
      if (!tables.includes(match[1])) tables.push(match[1]);
    }
  }
  const tableText = tables.length ? ` trên ${tables.slice(0, 5).join(', ')}` : '';
  return `${operation || 'SQL'}${tableText}`;
}

function formatTemplate(node, source) {
  const raw = sourceOf(node, source);
  if (/\b(SELECT|INSERT|UPDATE|DELETE|MERGE|CREATE|ALTER|DROP|EXEC(?:UTE)?)\b/i.test(raw)) {
    return `[CÂU LỆNH ${summarizeSql(raw)}]`;
  }
  return trimText(raw, 120);
}

function formatExpression(node, source) {
  if (!node) return 'không có giá trị';

  switch (node.type) {
    case 'StringLiteral':
      return JSON.stringify(node.value);
    case 'NumericLiteral':
    case 'BooleanLiteral':
      return String(node.value);
    case 'NullLiteral':
      return 'NULL';
    case 'Identifier':
      return node.name;
    case 'ThisExpression':
      return 'this';
    case 'TemplateLiteral':
      return formatTemplate(node, source);
    case 'AwaitExpression':
      return `GỌI BẤT ĐỒNG BỘ ${formatExpression(node.argument, source)}`;
    case 'UnaryExpression': {
      const operator = node.operator === '!' ? 'NOT ' : node.operator;
      return `${operator}${formatExpression(node.argument, source)}`;
    }
    case 'BinaryExpression':
    case 'LogicalExpression': {
      const operators = {
        '===': '=',
        '==': '=',
        '!==': '≠',
        '!=': '≠',
        '&&': 'AND',
        '||': 'OR',
        '??': 'NẾU RỖNG THÌ',
      };
      return `${formatExpression(node.left, source)} ${operators[node.operator] || node.operator} ${formatExpression(node.right, source)}`;
    }
    case 'ConditionalExpression':
      return `NẾU ${formatExpression(node.test, source)} THÌ ${formatExpression(node.consequent, source)} NGƯỢC LẠI ${formatExpression(node.alternate, source)}`;
    case 'MemberExpression':
    case 'OptionalMemberExpression': {
      const object = formatExpression(node.object, source);
      const property = node.computed ? `[${formatExpression(node.property, source)}]` : `.${formatExpression(node.property, source)}`;
      return `${object}${property}`;
    }
    case 'ArrayExpression':
      return `[${node.elements.map((item) => formatExpression(item, source)).join(', ')}]`;
    case 'ObjectExpression':
      return `{ ${node.properties.map((property) => {
        if (property.type === 'SpreadElement') return `...${formatExpression(property.argument, source)}`;
        const key = property.computed ? formatExpression(property.key, source) : (property.key.name || property.key.value);
        return `${key}: ${formatExpression(property.value, source)}`;
      }).join(', ')} }`;
    case 'CallExpression':
    case 'OptionalCallExpression': {
      const callee = formatExpression(node.callee, source);
      const args = node.arguments.map((arg) => {
        if (arg.type === 'SpreadElement') return `...${formatExpression(arg.argument, source)}`;
        return formatExpression(arg, source);
      }).join(', ');

      if (/(^|\.)parseInt$/.test(callee)) return `CHUYỂN SANG SỐ NGUYÊN(${args})`;
      if (/(^|\.)parseFloat$/.test(callee)) return `CHUYỂN SANG SỐ THỰC(${args})`;
      if (/\.query$/.test(callee)) {
        const sqlArg = node.arguments[0];
        return `THỰC THI TRUY VẤN ${sqlArg ? formatExpression(sqlArg, source) : 'SQL'}`;
      }
      if (/\.execute$/.test(callee)) {
        const proc = node.arguments[0] ? formatExpression(node.arguments[0], source) : 'stored procedure';
        return `THỰC THI STORED PROCEDURE ${proc}`;
      }
      return `${callee}(${args})`;
    }
    case 'NewExpression':
      return `TẠO ${formatExpression(node.callee, source)}(${node.arguments.map((arg) => formatExpression(arg, source)).join(', ')})`;
    case 'AssignmentExpression':
      return `${formatExpression(node.left, source)} ${node.operator === '=' ? '=' : node.operator} ${formatExpression(node.right, source)}`;
    case 'UpdateExpression':
      return `${formatExpression(node.argument, source)} ${node.operator === '++' ? 'TĂNG 1' : 'GIẢM 1'}`;
    case 'SequenceExpression':
      return node.expressions.map((item) => formatExpression(item, source)).join('; ');
    case 'ArrowFunctionExpression':
    case 'FunctionExpression':
      return `HÀM CALLBACK(${node.params.map((param) => formatExpression(param, source)).join(', ')})`;
    default:
      return trimText(sourceOf(node, source), 180);
  }
}

function responseInfo(node, source) {
  if (!node) return null;
  const target = node.type === 'AwaitExpression' ? node.argument : node;
  if (!target || target.type !== 'CallExpression') return null;

  const callee = target.callee;
  if (
    callee
    && callee.type === 'MemberExpression'
    && callee.property
    && ['json', 'send', 'end'].includes(callee.property.name)
  ) {
    const owner = callee.object;
    let status = '200';
    if (
      owner
      && owner.type === 'CallExpression'
      && owner.callee.type === 'MemberExpression'
      && owner.callee.property.name === 'status'
    ) {
      status = owner.arguments[0] ? formatExpression(owner.arguments[0], source) : '200';
    }
    const payload = target.arguments[0] ? formatExpression(target.arguments[0], source) : 'không có nội dung';
    return { status, payload };
  }
  return null;
}

function indent(level) {
  return '    '.repeat(Math.max(0, level));
}

function pushLine(lines, level, text) {
  if (!text) return;
  const normalized = compact(text);
  if (!normalized) return;
  lines.push(`${indent(level)}${normalized}`);
}

function isParseIntFallback(node) {
  return Boolean(
    node
    && node.type === 'LogicalExpression'
    && node.operator === '||'
    && node.left
    && node.left.type === 'CallExpression'
    && /(?:^|\.)parseInt$/.test(formatExpression(node.left.callee, ''))
  );
}

function emitVariableDeclaration(node, source, lines, level) {
  for (const declaration of node.declarations) {
    const name = formatExpression(declaration.id, source);
    const init = declaration.init;
    if (!init) {
      pushLine(lines, level, `${name} = NULL`);
      continue;
    }

    if (isParseIntFallback(init)) {
      const rawValue = init.left.arguments[0] ? formatExpression(init.left.arguments[0], source) : name;
      const radix = init.left.arguments[1] ? `, cơ số ${formatExpression(init.left.arguments[1], source)}` : '';
      const fallback = formatExpression(init.right, source);
      pushLine(lines, level, `${name} = ${rawValue}`);
      pushLine(lines, level, `IF ${name} không tồn tại hoặc không chuyển được sang số nguyên THEN`);
      pushLine(lines, level + 1, `${name} = ${fallback}`);
      pushLine(lines, level, 'ELSE');
      pushLine(lines, level + 1, `${name} = CHUYỂN SANG SỐ NGUYÊN(${name}${radix})`);
      pushLine(lines, level, 'END IF');
      continue;
    }

    if (init.type === 'AwaitExpression') {
      pushLine(lines, level, `${name} = ${formatExpression(init, source)}`);
    } else {
      pushLine(lines, level, `${name} = ${formatExpression(init, source)}`);
    }
  }
}

function emitCall(node, source, lines, level) {
  const response = responseInfo(node, source);
  if (response) {
    pushLine(lines, level, `TRẢ VỀ HTTP ${response.status} CÙNG DỮ LIỆU ${response.payload}`);
    return;
  }

  const target = node.type === 'AwaitExpression' ? node.argument : node;
  if (target && target.type === 'CallExpression') {
    const callee = formatExpression(target.callee, source);
    const args = target.arguments.map((arg) => formatExpression(arg, source)).join(', ');
    if (callee === 'next' && args === 'error') {
      pushLine(lines, level, 'CHUYỂN LỖI CHO MIDDLEWARE XỬ LÝ');
      return;
    }
    if (/\.begin$/.test(callee)) {
      pushLine(lines, level, 'BẮT ĐẦU TRANSACTION');
      return;
    }
    if (/\.commit$/.test(callee)) {
      pushLine(lines, level, 'COMMIT TRANSACTION');
      return;
    }
    if (/\.rollback$/.test(callee)) {
      pushLine(lines, level, 'ROLLBACK TRANSACTION');
      return;
    }
    if (/\.query$/.test(callee)) {
      const sqlArg = target.arguments[0];
      pushLine(lines, level, `THỰC THI TRUY VẤN ${sqlArg ? formatExpression(sqlArg, source) : 'SQL'}`);
      return;
    }
    if (/\.execute$/.test(callee)) {
      const proc = target.arguments[0] ? formatExpression(target.arguments[0], source) : 'stored procedure';
      pushLine(lines, level, `THỰC THI STORED PROCEDURE ${proc}`);
      return;
    }
  }

  pushLine(lines, level, `THỰC HIỆN ${formatExpression(node, source)}`);
}

function emitStatement(node, source, lines, level = 1) {
  if (!node) return;
  switch (node.type) {
    case 'BlockStatement':
      for (const statement of node.body) emitStatement(statement, source, lines, level);
      return;
    case 'VariableDeclaration':
      emitVariableDeclaration(node, source, lines, level);
      return;
    case 'ExpressionStatement': {
      const expr = node.expression;
      if (expr.type === 'AssignmentExpression') {
        pushLine(lines, level, `${formatExpression(expr.left, source)} = ${formatExpression(expr.right, source)}`);
      } else {
        emitCall(expr, source, lines, level);
      }
      return;
    }
    case 'ReturnStatement': {
      const response = responseInfo(node.argument, source);
      if (response) {
        pushLine(lines, level, `TRẢ VỀ HTTP ${response.status} CÙNG DỮ LIỆU ${response.payload}`);
      } else {
        pushLine(lines, level, `RETURN ${formatExpression(node.argument, source)}`);
      }
      return;
    }
    case 'ThrowStatement':
      pushLine(lines, level, `THROW ERROR ${formatExpression(node.argument, source)}`);
      return;
    case 'IfStatement':
      pushLine(lines, level, `IF ${formatExpression(node.test, source)} THEN`);
      emitStatement(node.consequent, source, lines, level + 1);
      if (node.alternate) {
        if (node.alternate.type === 'IfStatement') {
          pushLine(lines, level, 'ELSE');
          emitStatement(node.alternate, source, lines, level + 1);
        } else {
          pushLine(lines, level, 'ELSE');
          emitStatement(node.alternate, source, lines, level + 1);
        }
      }
      pushLine(lines, level, 'END IF');
      return;
    case 'TryStatement':
      pushLine(lines, level, 'TRY');
      emitStatement(node.block, source, lines, level + 1);
      if (node.handler) {
        const errorName = node.handler.param ? formatExpression(node.handler.param, source) : 'error';
        pushLine(lines, level, `CATCH ${errorName}`);
        emitStatement(node.handler.body, source, lines, level + 1);
      }
      if (node.finalizer) {
        pushLine(lines, level, 'FINALLY');
        emitStatement(node.finalizer, source, lines, level + 1);
      }
      pushLine(lines, level, 'END TRY');
      return;
    case 'ForOfStatement':
      pushLine(lines, level, `FOR EACH ${formatExpression(node.left, source).replace(/^(const|let|var)\s+/, '')} IN ${formatExpression(node.right, source)}`);
      emitStatement(node.body, source, lines, level + 1);
      pushLine(lines, level, 'END FOR');
      return;
    case 'ForInStatement':
      pushLine(lines, level, `FOR EACH KEY ${formatExpression(node.left, source).replace(/^(const|let|var)\s+/, '')} IN ${formatExpression(node.right, source)}`);
      emitStatement(node.body, source, lines, level + 1);
      pushLine(lines, level, 'END FOR');
      return;
    case 'ForStatement': {
      const initText = node.init ? formatExpression(node.init, source) : '';
      const testText = node.test ? formatExpression(node.test, source) : 'TRUE';
      const updateText = node.update ? formatExpression(node.update, source) : '';
      pushLine(lines, level, `FOR ${initText}; WHILE ${testText}; ${updateText}`);
      emitStatement(node.body, source, lines, level + 1);
      pushLine(lines, level, 'END FOR');
      return;
    }
    case 'WhileStatement':
      pushLine(lines, level, `WHILE ${formatExpression(node.test, source)}`);
      emitStatement(node.body, source, lines, level + 1);
      pushLine(lines, level, 'END WHILE');
      return;
    case 'DoWhileStatement':
      pushLine(lines, level, 'DO');
      emitStatement(node.body, source, lines, level + 1);
      pushLine(lines, level, `WHILE ${formatExpression(node.test, source)}`);
      return;
    case 'SwitchStatement':
      pushLine(lines, level, `SWITCH ${formatExpression(node.discriminant, source)}`);
      for (const switchCase of node.cases) {
        pushLine(lines, level + 1, switchCase.test ? `CASE ${formatExpression(switchCase.test, source)}` : 'DEFAULT');
        for (const statement of switchCase.consequent) emitStatement(statement, source, lines, level + 2);
      }
      pushLine(lines, level, 'END SWITCH');
      return;
    case 'BreakStatement':
      pushLine(lines, level, 'BREAK');
      return;
    case 'ContinueStatement':
      pushLine(lines, level, 'CONTINUE');
      return;
    case 'EmptyStatement':
      return;
    default:
      pushLine(lines, level, `THỰC HIỆN ${trimText(sourceOf(node, source), 180)}`);
  }
}

function functionName(node, parent) {
  if (node.type === 'ClassMethod' || node.type === 'ClassPrivateMethod' || node.type === 'ObjectMethod') {
    return node.key.name || node.key.value || 'anonymous';
  }
  if (node.type === 'FunctionDeclaration') return node.id ? node.id.name : 'anonymous';
  if (
    (node.type === 'ArrowFunctionExpression' || node.type === 'FunctionExpression')
    && parent
    && parent.type === 'VariableDeclarator'
    && parent.id.type === 'Identifier'
  ) {
    return parent.id.name;
  }
  return null;
}

function collectFunctions(ast, source, relPath) {
  const records = [];
  const seen = new Set();

  function visit(node, parent = null, className = null) {
    if (!node || typeof node !== 'object') return;
    const currentClass = node.type === 'ClassDeclaration' || node.type === 'ClassExpression'
      ? (node.id ? node.id.name : className)
      : className;
    const name = functionName(node, parent);

    if (name && node.body) {
      const key = `${node.start}:${node.end}:${name}`;
      if (!seen.has(key)) {
        seen.add(key);
        const params = node.params.map((param) => trimText(sourceOf(param, source), 120));
        const lines = [`FUNCTION ${name}(${params.join(', ')})`];
        if (node.body.type === 'BlockStatement') {
          emitStatement(node.body, source, lines, 1);
        } else if (node.body.type === 'ArrowFunctionExpression' || node.body.type === 'FunctionExpression') {
          const callbackParams = node.body.params.map((param) => trimText(sourceOf(param, source), 120));
          pushLine(lines, 1, `RETURN MIDDLEWARE FUNCTION(${callbackParams.join(', ')})`);
          if (node.body.body.type === 'BlockStatement') {
            emitStatement(node.body.body, source, lines, 2);
          } else {
            pushLine(lines, 2, `RETURN ${formatExpression(node.body.body, source)}`);
          }
          pushLine(lines, 1, 'END MIDDLEWARE FUNCTION');
        } else {
          pushLine(lines, 1, `RETURN ${formatExpression(node.body, source)}`);
        }
        lines.push('END FUNCTION');
        records.push({
          file: relPath.replace(/\\/g, '/'),
          className: currentClass || null,
          name,
          async: Boolean(node.async),
          params,
          signature: `${node.async ? 'async ' : ''}${name}(${params.join(', ')})`,
          startLine: source.slice(0, node.start).split(/\r?\n/).length,
          pseudocode: lines.join('\n'),
        });
      }
    }

    for (const [key, value] of Object.entries(node)) {
      if (['loc', 'start', 'end', 'extra', 'tokens', 'comments'].includes(key)) continue;
      if (Array.isArray(value)) {
        for (const child of value) visit(child, node, currentClass);
      } else if (value && typeof value === 'object' && value.type) {
        visit(value, node, currentClass);
      }
    }
  }

  visit(ast.program);
  return records.sort((a, b) => a.startLine - b.startLine);
}

function main() {
  const files = walkFiles(BACKEND)
    .filter((file) => file.endsWith('.js'))
    .filter((file) => !file.includes(`${path.sep}routes${path.sep}`))
    .sort();

  const output = [];
  for (const file of files) {
    const source = fs.readFileSync(file, 'utf8');
    const relPath = path.relative(BACKEND, file);
    let ast;
    try {
      ast = parser.parse(source, {
        sourceType: 'unambiguous',
        allowReturnOutsideFunction: true,
        plugins: [
          'classProperties',
          'classPrivateProperties',
          'classPrivateMethods',
          'optionalChaining',
          'nullishCoalescingOperator',
          'objectRestSpread',
          'topLevelAwait',
        ],
      });
    } catch (error) {
      output.push({
        file: relPath.replace(/\\/g, '/'),
        parseError: error.message,
        functions: [],
      });
      continue;
    }
    output.push({
      file: relPath.replace(/\\/g, '/'),
      functions: collectFunctions(ast, source, relPath),
    });
  }

  fs.writeFileSync(OUTPUT, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
  const functionCount = output.reduce((sum, file) => sum + file.functions.length, 0);
  console.log(`Wrote ${functionCount} functions from ${output.length} files to ${OUTPUT}`);
}

main();
