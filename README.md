# eva

- s-expression
- AST based interpreter
- Use syntax-cli to generate a parser
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
