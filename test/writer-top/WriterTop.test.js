const WriterTop = require("../../writer-top/WriterTop.js")

test('Test render', () => {
    const top = new WriterTop(1, 0)
    top.users = {
        1: {
            "user_name": "Test",
            "user_id": 1,
            "count": 1
        },
        2: {
            "user_name": "Test2",
            "user_id": 2,
            "count": 2
        },
    }
    top.posts = {
        1: [{
            "post_id": 2,
            "user_id": 1,
            "subject": "Test topic",
            "posted": 100
        }],
        2: [
            {
                "post_id": 1,
                "user_id": 2,
                "subject": "Test topic",
                "posted": 80
            },
            {
                "post_id": 3,
                "user_id": 2,
                "subject": "Test topic",
                "posted": 200
            }
        ]
    }
    expect(top.render()).toBe('<div><span>Test2</span><span>2</span><span><ul><li><a href="/viewtopic.php?pid=1">Test topic (80)</a></li><li><a href="/viewtopic.php?pid=3">Test topic (200)</a></li></ul></span></div><div><span>Test</span><span>1</span><span><ul><li><a href="/viewtopic.php?pid=2">Test topic (100)</a></li></ul></span></div>')
})
