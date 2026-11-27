import {author} from './author.ts';
export const {lesson,deep}=author({
  "slug": "raft",
  "order": 50,
  "title": "Distributed Consensus (Raft) — توافق روی لاگ",
  "description": "انتخابات term، replication، majority commit و failover.",
  "actors": [
    [
      "Node A",
      "Leader / candidate",
      "app"
    ],
    [
      "Node B",
      "Follower",
      "db"
    ],
    [
      "Node C",
      "Follower",
      "db"
    ]
  ],
  "edges": [
    [
      0,
      1
    ],
    [
      0,
      2
    ],
    [
      1,
      2
    ]
  ],
  "labels": [
    "A term/log",
    "B term/log",
    "C term/log"
  ],
  "context": "Raft سه گره با crash failure، بدون Byzantine؛ quorum=2؛ entry term جاری، رأی طبق up-to-date log، commit از majority و current-term rule.",
  "goal": "تفاوت leader election، ثبت log و commit را بفهمید؛ minority حق commit تازه ندارد.",
  "scenarios": [
    [
      "election",
      "انتخابات رهبر",
      "دو رأی از سه گره کافی است؟",
      "term 2",
      [
        [
          "آغاز انتخابات",
          [
            0
          ],
          [
            "term=2 self vote"
          ],
          "A timeout; vote for A",
          "A candidate",
          [
            "Candidate t2 votes=1",
            "Follower t1",
            "Follower t1"
          ],
          "A term را افزایش و به خود رأی می‌دهد.",
          "currentTerm و votedFor قبل از پاسخ پایدار می‌شوند."
        ],
        [
          "درخواست رأی",
          [
            0,
            1
          ],
          [
            "RequestVote",
            "VoteGranted"
          ],
          "log up-to-date",
          "2 votes",
          [
            "Candidate t2 votes=2",
            "Voted A t2",
            "Follower t1"
          ],
          "B یک رأی در term 2 و شرط log را رعایت می‌کند.",
          "رأی تنها بر اساس term نیست؛ log freshness مهم است."
        ],
        [
          "رهبری",
          [
            0,
            2
          ],
          [
            "AppendEntries heartbeat"
          ],
          "majority reached",
          "A leader",
          [
            "Leader t2",
            "Follower t2",
            "Follower t2"
          ],
          "A با دو رأی رهبر می‌شود؛ heartbeat C را آگاه می‌کند.",
          "رهبر term قبلی با term بالاتر باید follower شود.",
          "success"
        ]
      ]
    ],
    [
      "commit",
      "ثبت و commit در majority",
      "آیا append محلی به معنی commit است؟",
      "term 2 entry index 7",
      [
        [
          "افزودن محلی",
          [
            0
          ],
          [
            "append 7,t2"
          ],
          "client command x=1",
          "Uncommitted",
          [
            "t2 log=7 commit=6",
            "log=6",
            "log=6"
          ],
          "رهبر entry را در لاگ خودش ثبت کرد.",
          "append با apply و commit فرق دارد."
        ],
        [
          "replication",
          [
            0,
            1
          ],
          [
            "AppendEntries 7",
            "ACK"
          ],
          "B persists entry 7",
          "2 copies",
          [
            "log=7 pending",
            "log=7",
            "log=6"
          ],
          "B entry را پس از تطبیق prevLogIndex/Term ثبت می‌کند.",
          "ACK بعد از دوام طبق مدل؛ C هنوز عقب است."
        ],
        [
          "commit",
          [
            0
          ],
          [
            "commitIndex=7"
          ],
          "majority current-term entry",
          "Committed index 7",
          [
            "commit=7 applied",
            "log=7",
            "log=6"
          ],
          "entry term جاری در اکثریت ثبت شده و leader commit می‌کند.",
          "اعلام commit و catch-up follower مرحله بعد است."
        ],
        [
          "انتشار commit",
          [
            0,
            1
          ],
          [
            "leaderCommit=7"
          ],
          "AppendEntries heartbeat",
          "B applied 7",
          [
            "commit=7",
            "commit=7",
            "log=6"
          ],
          "B پس از اطلاع از commit، apply می‌کند.",
          "C با AppendEntries بعدی جبران می‌شود.",
          "success"
        ]
      ]
    ],
    [
      "minority",
      "رهبر جداشده",
      "آیا A تنها می‌تواند write تازه تأیید کند؟",
      "A isolated; B,C connected",
      [
        [
          "partition",
          [
            0,
            1
          ],
          [
            "link lost"
          ],
          "A cannot contact B,C",
          "A isolated",
          [
            "Leader t2 isolated",
            "Follower t2",
            "Follower t2"
          ],
          "A ممکن است هنوز خودش را رهبر بداند.",
          "تشخیص partition آنی نیست.",
          "error"
        ],
        [
          "append بدون quorum",
          [
            0
          ],
          [
            "append 8,t2"
          ],
          "client write",
          "Not committed",
          [
            "log=8 commit=7",
            "log=7",
            "log=7"
          ],
          "A فقط یک کپی دارد؛ پاسخ موفق commit نمی‌دهد.",
          "deadline client می‌تواند نتیجه را نامعلوم کند.",
          "error"
        ],
        [
          "رهبر جدید",
          [
            1,
            2
          ],
          [
            "RequestVote t3",
            "VoteGranted"
          ],
          "B has up-to-date committed prefix",
          "B leader term3",
          [
            "Old leader t2",
            "Leader t3",
            "Follower t3"
          ],
          "B و C اکثریت‌اند و می‌توانند انتخاب کنند.",
          "committed prefix با شرط رأی حفظ می‌شود."
        ],
        [
          "بازگشت A",
          [
            1,
            0
          ],
          [
            "AppendEntries t3"
          ],
          "conflict repair; higher term",
          "A steps down",
          [
            "Follower t3 log repaired",
            "Leader t3",
            "Follower t3"
          ],
          "A term بالاتر را می‌بیند و entry ثبت‌نشده ناسازگار ممکن است حذف شود.",
          "commit شده‌ها نباید بازنویسی شوند.",
          "success"
        ]
      ],
      "minority قادر به commit جدید نیست."
    ]
  ],
  "pitfall": "Raft معادل replication ساده نیست؛ safety به term، رأی، log matching، leader completeness و قاعده commit وابسته است.",
  "takeaway": "اکثریت برای انتخاب و commit لازم است؛ append و apply را جدا نگه دارید.",
  "quiz": [
    "در سه گره، quorum چند است؟",
    [
      "۱",
      "۲",
      "۳ همیشه"
    ],
    1,
    "اکثریت floor(3/2)+1=2 است."
  ],
  "practice": [
    "A رهبر قدیمی و isolated، B/C رهبر term بالاتر دارند؛ A می‌تواند entry تازه را committed اعلام کند؟",
    [
      "خیر؛ اکثریت ندارد",
      "بله چون قبلاً leader بود",
      "بله اگر append محلی کرد"
    ],
    0,
    "مالکیت term قدیمی و append محلی کافی نیست."
  ],
  "hint": "quorum و term جاری را بررسی کنید.",
  "terms": [
    [
      "Term",
      "دوره منطقی انتخابات"
    ],
    [
      "Quorum",
      "اکثریت رأی یا replication"
    ],
    [
      "Commit index",
      "بالاترین index ثبت‌شده"
    ]
  ],
  "references": [
    [
      "Raft — official paper and materials",
      "https://raft.github.io/"
    ],
    [
      "etcd fault tolerance",
      "https://etcd.io/docs/v3.5/faq/#what-is-failure-tolerance"
    ]
  ],
  "exercise": [
    "اکثریت برای خوشه‌های ۳ و ۵ را محاسبه کنید.",
    "for n in (3,5): print(n,n//2+1)\nassert 3//2+1==2 and 5//2+1==3",
    "۳→۲ و ۵→۳.",
    "این پیاده‌سازی Raft نیست."
  ],
  "deep": {
    "title": "Commit با یک follower یا بدون follower",
    "question": "با دو کپی از entry term جاری و با یک کپی چه نتیجه‌ای داریم؟",
    "assumptions": "سه node، term=4، commitIndex=10، entry جدید 11 term4. هیچ reconfiguration یا Byzantine failure وجود ندارد.",
    "lanes": [
      "Leader A",
      "Follower B",
      "Follower C"
    ],
    "fields": {
      "a": "lastIndex A",
      "b": "lastIndex B",
      "c": "lastIndex C",
      "commit": "commitIndex",
      "acks": "کپی پایدار"
    },
    "code": "if count(matchIndex >= N) >= majority && log[N].term == currentTerm:\n    commitIndex = N\n# follower learns leaderCommit in AppendEntries",
    "cases": [
      [
        "majority",
        "یک follower پاسخ می‌دهد",
        {
          "a": 10,
          "b": 10,
          "c": 10,
          "commit": 10,
          "acks": 0
        },
        [
          [
            0,
            0,
            null,
            "append محلی",
            "11,t4",
            "رهبر entry جدید را پایدار می‌کند.",
            {
              "a": 11,
              "acks": 1
            }
          ],
          [
            1,
            0,
            1,
            "replicate",
            "AppendEntries",
            "B تطبیق prev log را انجام می‌دهد.",
            {
              "b": 11
            }
          ],
          [
            2,
            1,
            0,
            "ACK B",
            "matchIndex=11",
            "دو کپی پایدار وجود دارد.",
            {
              "acks": 2
            }
          ],
          [
            3,
            0,
            null,
            "commit",
            "commitIndex=11",
            "entry term جاری به majority رسیده.",
            {
              "commit": 11
            },
            "success"
          ],
          [
            4,
            0,
            1,
            "اطلاع follower",
            "leaderCommit=11",
            "B می‌تواند apply کند.",
            {
              "b": 11
            }
          ]
        ],
        "commit 11 ممکن شد، C عقب است."
      ],
      [
        "minority",
        "هر دو follower جدا",
        {
          "a": 10,
          "b": 10,
          "c": 10,
          "commit": 10,
          "acks": 0
        },
        [
          [
            0,
            0,
            null,
            "append محلی",
            "11,t4",
            "فقط leader ثبت کرده.",
            {
              "a": 11,
              "acks": 1
            }
          ],
          [
            1,
            0,
            1,
            "عدم ACK B",
            "timeout",
            "B در partition است.",
            {
              "b": 10
            },
            "error"
          ],
          [
            2,
            0,
            2,
            "عدم ACK C",
            "timeout",
            "C نیز جداست.",
            {
              "c": 10
            },
            "error"
          ],
          [
            3,
            0,
            null,
            "عدم commit",
            "quorum=1/3",
            "entry جدید committed نیست.",
            {
              "commit": 10
            },
            "error"
          ]
        ],
        "commitIndex روی ۱۰ می‌ماند."
      ]
    ],
    "diagnose": "term، leader changes، matchIndex، commitIndex، apply lag و fsync latency را بررسی کنید.",
    "tradeoff": "Raft availability را در minority قربانی می‌کند؛ linearizable read نیز نیاز به تأیید leadership/ReadIndex یا سازوکار معتبر دارد."
  }
});
export default lesson;
