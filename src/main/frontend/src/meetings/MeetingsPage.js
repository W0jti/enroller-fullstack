import {useEffect, useState} from "react";
import NewMeetingForm from "./NewMeetingForm";
import MeetingsList from "./MeetingsList";

export default function MeetingsPage({username}) {
    const [meetings, setMeetings] = useState([]);
    const [addingNewMeeting, setAddingNewMeeting] = useState(false);
    useEffect(() => {
        const fetchMeetings = async () => {
            const response = await fetch(`/api/meetings`);
            if (response.ok) {
                const meetings = await response.json();
                setMeetings(meetings);
            }
        };
        fetchMeetings();
    }, []);

    async function handleNewMeeting(meeting) {
        const response = await fetch('/api/meetings', {
            method: 'POST',
            body: JSON.stringify(meeting),
            headers: {'Content-Type': 'application/json'}
        });
        if (response.ok) {
            const addedMeeting = await response.json();
            const nextMeetings = [...meetings, addedMeeting];
            setMeetings(nextMeetings);
            setAddingNewMeeting(false);
        }
    }

    async function handleDeleteMeeting(meeting) {
        const response = await fetch(`/api/meetings/${meeting.id}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            const nextMeetings = meetings.filter(m => m !== meeting);
            setMeetings(nextMeetings);
        }
    }

    async function handleSignIn(meeting) {
        try {
            const response = await fetch(`/api/meetings/${meeting.id}/participants`, {
                method: 'POST',
                body: JSON.stringify({ login: username }),
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                const updatedParticipants = await response.json();
                const nextMeetings = meetings.map(m => {
                    if (m.id === meeting.id) {
                        return { ...m, participants: updatedParticipants};
                    }
                    return m;
                });
                setMeetings(nextMeetings);
            } else {
                console.error('Failed to sign in to a meeting: ', response.statusText);
            }
        } catch (error) {
            console.error('Error during sign in: ', error)
        }

    }

    async function handleSignOut(meeting) {
        try {
            const response = await fetch(`/api/meetings/${meeting.id}/participants/${username}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                const updatedParticipants = await response.json();
                const nextMeetings = meetings.map(m => {
                    if (m.id === meeting.id) {
                        return { ...m, participants: updatedParticipants};
                    }
                    return m;
                });
                setMeetings(nextMeetings);
            } else {
                console.error('Failed to sign out of a meeting: ', response.statusText);
            }
        } catch(error) {
            console.error('Error during sign out: ', error);
        }
    }

    return (
        <div>
            <h2>Zajęcia ({meetings.length})</h2>
            {
                addingNewMeeting
                    ? <NewMeetingForm onSubmit={(meeting) => handleNewMeeting(meeting)}/>
                    : <button onClick={() => setAddingNewMeeting(true)}>Dodaj nowe spotkanie</button>
            }
            {meetings.length > 0 &&
                <MeetingsList meetings={meetings} username={username}
                              onDelete={handleDeleteMeeting}
                              onSignIn={handleSignIn}
                              onSignOut={handleSignOut}/>}
        </div>
    )
}