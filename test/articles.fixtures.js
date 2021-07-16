const makeArticlesArray = ()=> {
    return [
        {
            id: 1,
            date_published: '2029-01-22T16:28:32.615Z',
            title: 'First Test Post Title!',
            style: 'How-to',
            content: `First content here. First is first because it's first yo forever and always!!!`,
            author: 1
        },
        {
            id: 2,
            date_published: '2100-05-22T16:28:32.615Z',
            title: 'Second Test Post Title!',
            style: 'News',
            content: `Second content here. Second is Second because it's Second yo forever and always!!!`,
            author: 2
        },
        {
            id: 3,
            date_published: '1919-12-22T16:28:32.615Z',
            title: 'Third Test Post Title!',
            style: 'Listicle',
            content: `Third content here. Third is third because it's third yo forever and always!!!`,
            author: 1
        },
        {
            id: 4,
            date_published: '1919-12-22T16:28:32.615Z',
            title: 'Fourth Test Post Title!',
            style: 'Story',
            content: `Fourth content here. Fourth is Fourth because it's Fourth yo forever and always!!!`,
            author: 2
        }
    ];
    
};

module.exports = {
    makeArticlesArray
};