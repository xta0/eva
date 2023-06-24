# eva

- s-expression
- AST based interpreter
- The parser is generate by the syntax-cli tool
- BNF

```
Exp
  : Atom
  | List
  ;

Atom
  : NUMBER { $$ = Number($1) }
  | STRING
  | SYMBOL
  ;

List
  : '(' ListEntries ')' { $$ = $2 }
  ;

ListEntries
  : ListEntries Exp { $1.push($2); $$ = $1 }
  | /* empty */     { $$ = [] }
  ;
```
