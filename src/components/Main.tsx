import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import '../App.css';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

const bull = (
    <Box
        component="span"
        sx={{ display: 'inline-block', mx: '2px', transform: 'scale(0.8)' }}
    >
        •
    </Box>
);

interface Post {
    title: string;
    message: string;
    context: string;
    location: string;
    numLikes: number;
    numBookmarks: number;
    numViews: number;
}

const PostCreator: React.FC = () => {
    const [postCount, setPostCount] = useState<number>(0);
    const [successfulPosts, setSuccessfulPosts] = useState<number>(0);
    const [failedPosts, setFailedPosts] = useState<number>(0);
    const [queueSize, setQueueSize] = useState<number>(0);
    const [mongoCount, setMongoCount] = useState<number>(0);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [searchResults, setSearchResults] = useState<Post[]>([]);
    const [open, setOpen] = useState<boolean>(false);
    const [title, setTitle] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [context, setContext] = useState<string>('');
    const [location, setLocation] = useState<string>('');
    const [likes, setLikes] = useState<number>(0);
    const [bookmark, setBookmark] = useState<number>(0);
    const [views, setViews] = useState<number>(0);
    const [error, setError] = useState<string>('');


    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleCreatePost = async (): Promise<void> => {
        setPostCount(postCount + 1);
        setQueueSize(queueSize + 1);
        setError('')
        try {
            const response = await axios.post<Post>('http://localhost:5000/api/posts', {
                title,
                message,
                context,
                location,
                numLikes: likes,
                numBookmarks: bookmark,
                numViews: views
            });
            setSuccessfulPosts(successfulPosts + 1);
            handleGetPostCount()
        } catch (error) {
            setFailedPosts(failedPosts + 1);
        } finally {
            setQueueSize(prevQueueSize => {
                if (prevQueueSize > 0) {
                    return prevQueueSize - 1;
                } else {
                    return 0;
                }
            });
        }
    };


    const handleSearch = async () => {
        try {
            const response = await axios.get<Post[]>('http://localhost:5000/api/posts/search', {
                params: { query: searchQuery },
            });
            setSearchResults(response.data);
            if (response.data.length === 0) {
                setError('No matching post')
            } else {
                setError('')
            }
        } catch (error) {
            console.error('Search failed');
            setError('Search failed')
        }
    };

    const handleGetPostCount = async () => {
        try {
            const response = await axios.get<{ message: number }>('http://localhost:5000/api/posts/count');
            setMongoCount(response.data.message); // Update the state with the exact count from MongoDB
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        handleGetPostCount()
    }, [])

    const handleReset = (): void => {
        setPostCount(0);
        setSuccessfulPosts(0);
        setFailedPosts(0);
        setQueueSize(0);
        setSearchQuery('');
        setSearchResults([]);
    };

    return (
        <div>
            <Button variant="outlined" color="error" onClick={handleReset}>Reset State</Button>
            <Button variant="outlined" sx={{ marginLeft: "20px" }} onClick={handleClickOpen}>
                Create Post
            </Button>
            <p>Current Post Count: {postCount}</p>
            <p>Queue Size: {queueSize}</p>
            <p>Successful Posts: {successfulPosts}</p>
            <p>Failed Posts: {failedPosts}</p>
            <p>Posts in MongoDB: {mongoCount}</p>
            <input
                type="text"
                placeholder="Search Posts"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                id='search-input'
            />

            <Button onClick={handleSearch}>Search</Button>
            <div className='all-post'>
                {searchResults.map((data, index) => (
                    <Card sx={{ minWidth: 275 }} key={index}>
                        <CardContent>
                            <Typography variant="h5" component="div">
                                {data.title}
                            </Typography>
                            <Typography sx={{ mb: 1 }} color="text.secondary">
                                Message: {data.message}
                            </Typography>
                            <Typography sx={{ mb: 1 }} color="text.secondary">
                                Context: {data.context}
                            </Typography>
                            <Typography sx={{ mb: 1 }} color="text.secondary">
                                Location: {data.location}
                            </Typography>
                            <Typography variant="body2">
                                Likes: {data.numLikes}
                            </Typography>
                            <Typography variant="body2">
                                Bookmarks: {data.numBookmarks}
                            </Typography>
                            <Typography variant="body2">
                                Views: {data.numViews}
                            </Typography>
                        </CardContent>
                    </Card>
                ))}
            </div>
            {error && <h4 style={{ color: "red" }}>{error}</h4>}
            <Dialog
                open={open}
                onClose={handleClose}
                PaperProps={{
                    component: 'form',
                    onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
                        event.preventDefault();
                        handleCreatePost();
                    },
                }}
            >
                <DialogTitle>Create Post</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        To create a new post, fill out the following details
                    </DialogContentText>
                    <div className='post-row'>
                        <div className='post-column'>
                            <TextField
                                autoFocus
                                required
                                margin="dense"
                                id="title"
                                name="Title"
                                label="Title"
                                type="text"
                                fullWidth
                                variant="standard"
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>
                        <div className='post-column'>
                            <TextField
                                margin="dense"
                                id="location"
                                name="location"
                                label="Location"
                                type="text"
                                fullWidth
                                variant="standard"
                                onChange={(e) => setLocation(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className='post-row'>
                        <div className='post-column'>
                            <TextField
                                margin="dense"
                                id="context"
                                name="context"
                                label="Context"
                                type="text"
                                fullWidth
                                variant="standard"
                                onChange={(e) => setContext(e.target.value)}
                            />
                        </div>
                        <div className='post-column'>
                            <TextField
                                margin="dense"
                                id="likes"
                                name="likes"
                                label="Likes"
                                type="number"
                                fullWidth
                                variant="standard"
                                onChange={(e) => setLikes(Number(e.target.value))}
                            />
                        </div>
                    </div>
                    <div className='post-row'>
                        <div className='post-column'>
                            <TextField
                                margin="dense"
                                id="bookmarks"
                                name="bookmarks"
                                label="Bookmarks"
                                type="number"
                                fullWidth
                                variant="standard"
                                onChange={(e) => setBookmark(Number(e.target.value))}
                            />
                        </div>
                        <div className='post-column'>
                            <TextField
                                margin="dense"
                                id="numview"
                                name="numview"
                                label="Views"
                                type="number"
                                fullWidth
                                variant="standard"
                                onChange={(e) => setViews(Number(e.target.value))}
                            />
                        </div>
                    </div>
                    <div className='post-row'>
                        <div className='post-column'>
                            <TextField
                                required
                                margin="dense"
                                id="message"
                                name="message"
                                label="Message"
                                type="text"
                                fullWidth
                                variant="standard"
                                onChange={(e) => setMessage(e.target.value)}
                            />
                        </div>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Close</Button>
                    <Button type="submit">Create</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default PostCreator;
