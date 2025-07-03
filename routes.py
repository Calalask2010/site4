import os
from flask import render_template, request, redirect, url_for, flash, jsonify
from flask_mail import Message
from werkzeug.utils import secure_filename
from app import app, db, mail
from models import BlogPost, Portfolio, Contact, AudioTrack
from forms import ContactForm, AudioUploadForm, PortfolioForm, BlogForm

@app.route('/')
def index():
    # Get audio tracks for homepage
    audio_tracks = AudioTrack.query.order_by(AudioTrack.date_added.desc()).all()
    return render_template('index.html', tracks=audio_tracks)

@app.route('/about')
def about():
    return render_template('about.html')



@app.route('/admin/upload-audio', methods=['GET', 'POST'])
def upload_audio():
    form = AudioUploadForm()
    if form.validate_on_submit():
        file = form.audio_file.data
        if file:
            filename = secure_filename(file.filename)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)
            
            # Save to database
            track = AudioTrack(
                title=form.title.data,
                artist=form.artist.data,
                file_url=f"/static/uploads/{filename}"
            )
            db.session.add(track)
            db.session.commit()
            
            flash('Трек успешно загружен!', 'success')
            return redirect(url_for('index'))
    
    return render_template('upload_audio.html', form=form)

@app.route('/api/tracks')
def get_tracks():
    tracks = AudioTrack.query.order_by(AudioTrack.date_added.desc()).all()
    return jsonify([{
        'id': track.id,
        'title': track.title,
        'artist': track.artist,
        'file_url': track.file_url,
        'duration': track.duration
    } for track in tracks])
