test('Test render', () => {
    const top = new WriterTop(1, 0)
    top.users = {
        1: {
            "user_name": "Test",
            "user_id": 1,
            "count": 1
        }
    }
    top.posts = {
        1: [{
            "post_id": 1,
            "user_id": 1,
            "subject": "Test topic",
            "posted": 100
        }]
    }
    expects(top.render()).toBe('')
})