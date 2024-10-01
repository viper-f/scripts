const WriterTop = require("../../writer-top/WriterTop.js")
test('test render()', () => {
    const top = new WriterTop([1], 0)
    top.users = {
        "1": {
            "user_name": "Test",
            "user_id": "1",
            "count": "1"
        },
        "2": {
            "user_name": "Test2",
            "user_id": "2",
            "count": "2"
        },
    }
    top.posts = {
        "1": [{
            "post_id": "2",
            "user_id": "1",
            "subject": "Test topic",
            "posted": "100"
        }],
        "2": [
            {
                "post_id": "1",
                "user_id": "2",
                "subject": "Test topic",
                "posted": "80"
            },
            {
                "post_id": "3",
                "user_id": "2",
                "subject": "Test topic",
                "posted": "200"
            }
        ]
    }
    expect(top.render()).toBe('<div><span>Test2</span><span>2</span><span><ul><li><a href="/viewtopic.php?pid=1">Test topic (80)</a></li><li><a href="/viewtopic.php?pid=3">Test topic (200)</a></li></ul></span></div><div><span>Test</span><span>1</span><span><ul><li><a href="/viewtopic.php?pid=2">Test topic (100)</a></li></ul></span></div>')
})

test('test apiCall()', async () => {
    global.fetch = jest.fn().mockImplementation(() =>  Promise.resolve({ json: () => Promise.resolve({ "data": 100 })}));
    const top = new WriterTop(1, 0)
    const response = await top.apiCall('topic.get')
    expect(response).toStrictEqual({"data": "100"})
    global.fetch.mockClear();
    delete global.fetch;
})

test('test combineUrl()', () => {
    const top = new WriterTop([1], 0)
    expect(top.combineUrl('post.get')).toBe('/api.php?method=post.get')
    expect(top.combineUrl('post.get', {"topic_id": "25"})).toBe('/api.php?method=post.get&topic_id=25')
    expect(top.combineUrl('post.get', null, ['post_id'])).toBe('/api.php?method=post.get&fields=post_id')
    expect(top.combineUrl('post.get', null, ['post_id', 'username'])).toBe('/api.php?method=post.get&fields=post_id,username')
    expect(top.combineUrl('post.get', {"topic_id": "25"}, ['post_id', 'username'], 'posted'))
        .toBe('/api.php?method=post.get&topic_id=25&fields=post_id,username&sort_by=posted')

})

test('test findPosts()', async () => {
    global.fetch = jest.fn().mockImplementation(() =>
        Promise.resolve({
            json: () =>
                Promise.resolve(
                    {
                        "response": [
                            {
                                "subject": "мыслефлуд",
                                "posted": "1727747637",
                                "user_id": "2188",
                                "id": "1008879",
                                "username": "test1"
                            }
                        ]
                    }
                )
        }))


    const top = new WriterTop([1], 0)
    const result = await top.findPosts(1, 1)
    expect(top.users).toStrictEqual({"2188": {"count": 1, "user_id": "2188", "user_name": "test1"}})
    expect(top.posts).toStrictEqual({"2188": [{"post_id": "1008879", "posted": 1727747637, "subject": "мыслефлуд", "user_id": "2188"}]})
    global.fetch.mockClear();
    delete global.fetch;
})

// test('test processTopics()', () => {
//     global.fetch = jest.fn().mockImplementation(() =>
//         Promise.resolve({
//             json: () =>
//                 Promise.resolve(
//                     {
//                         "response": [
//                             {
//                                 "subject": "мыслефлуд",
//                                 "posted": "1727747637",
//                                 "user_id": "2188",
//                                 "id": "1008879",
//                                 "username": "test1"
//                             }
//                         ]
//                     }
//                 )
//         }))
// })

test('test toTimestamp()', () => {
    const top = new WriterTop([1], 0)
    expect(top.toTimestamp('2020-02-02 12:02:20')).toBe(1580662940)
})

test('test dateFormat()', () => {
    const top = new WriterTop([1], 0)
    expect(top.dateFormat(1580662940)).toBe('2020-02-02 12:02:20')
})
