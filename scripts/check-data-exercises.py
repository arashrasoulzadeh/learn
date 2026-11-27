"""Run the nine local Python/SQLite exercises exactly as authored; PostgreSQL lock demo requires two real sessions."""
import json
import pathlib
import subprocess
import sys
expected={
    'sql-nosql': ["(42, 'Sara')"],
    'database-index': ['SCAN p','SEARCH p USING INDEX idx_sku'],
    'b-tree': ['SEARCH t USING COVERING INDEX ix'],
    'transactions-acid': ["('A', 100)", "('B', 50)"],
    'connection-pooling': ['pool full','C1'],
    'caching': ['DB read','50\n50'],
    'cache-invalidation': ['45 50'],
    'replication': ['50\n45'],
    'sharding': ['{0: [42, 44], 1: [17, 19]}','hot shard: 0'],
}
for slug, fragments in expected.items():
    text=pathlib.Path('src/components/learning/data',slug+'.ts').read_text(encoding='utf-8')
    data=json.loads(text.split('const lesson = ',1)[1].rsplit(' satisfies BackendLesson',1)[0])
    result=subprocess.run([sys.executable,'-c',data['field']['command']],capture_output=True,text=True,timeout=10,check=True)
    for fragment in fragments:
        assert fragment in result.stdout, (slug,fragment,result.stdout)
    print(slug+': exercise passed')
print('9 local data exercises passed; two-session PostgreSQL example excluded.')
