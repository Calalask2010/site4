import os
from flask import render_template, request, redirect, url_for, flash, jsonify
from flask_mail import Message
from werkzeug.utils import secure_filename
from app import app, db, mail
from models import BlogPost, Portfolio, Contact, AudioTrack
from forms import ContactForm, AudioUploadForm, PortfolioForm, BlogForm

@app.route('/')
def index():
    # Get latest blog posts and portfolio items for homepage
    latest_posts = BlogPost.query.order_by(BlogPost.date_posted.desc()).limit(3).all()
    latest_portfolio = Portfolio.query.order_by(Portfolio.date_created.desc()).limit(3).all()
    audio_tracks = AudioTrack.query.order_by(AudioTrack.date_added.desc()).all()
    return render_template('index.html', posts=latest_posts, portfolio=latest_portfolio, tracks=audio_tracks)

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/portfolio')
def portfolio():
    portfolio_items = Portfolio.query.order_by(Portfolio.date_created.desc()).all()
    return render_template('portfolio.html', portfolio=portfolio_items)

@app.route('/contact', methods=['GET', 'POST'])
def contact():
    form = ContactForm()
    if form.validate_on_submit():
        # Save contact to database
        contact = Contact(
            name=form.name.data,
            email=form.email.data,
            subject=form.subject.data,
            message=form.message.data
        )
        db.session.add(contact)
        db.session.commit()
        
        # Send email notification
        try:
            msg = Message(
                subject=f"Новое сообщение от {form.name.data}: {form.subject.data}",
                recipients=[app.config['MAIL_DEFAULT_SENDER']],
                body=f"От: {form.name.data}\nEmail: {form.email.data}\n\nСообщение:\n{form.message.data}"
            )
            mail.send(msg)
            flash('Сообщение успешно отправлено!', 'success')
        except Exception as e:
            app.logger.error(f"Failed to send email: {e}")
            flash('Сообщение сохранено, но не удалось отправить email.', 'warning')
        
        return redirect(url_for('contact'))
    
    return render_template('contact.html', form=form)

@app.route('/blog')
def blog():
    page = request.args.get('page', 1, type=int)
    posts = BlogPost.query.order_by(BlogPost.date_posted.desc()).paginate(
        page=page, per_page=5, error_out=False
    )
    return render_template('blog.html', posts=posts)

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

@app.route('/admin/add-portfolio', methods=['GET', 'POST'])
def add_portfolio():
    form = PortfolioForm()
    if form.validate_on_submit():
        portfolio = Portfolio(
            title=form.title.data,
            description=form.description.data,
            image_url=form.image_url.data,
            project_url=form.project_url.data,
            technologies=form.technologies.data
        )
        db.session.add(portfolio)
        db.session.commit()
        
        flash('Проект добавлен в портфолио!', 'success')
        return redirect(url_for('portfolio'))
    
    return render_template('add_portfolio.html', form=form)

@app.route('/admin/add-blog', methods=['GET', 'POST'])
def add_blog():
    form = BlogForm()
    if form.validate_on_submit():
        post = BlogPost(
            title=form.title.data,
            content=form.content.data,
            image_url=form.image_url.data
        )
        db.session.add(post)
        db.session.commit()
        
        flash('Пост опубликован!', 'success')
        return redirect(url_for('blog'))
    
    return render_template('add_blog.html', form=form)

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

@app.errorhandler(404)
def not_found(error):
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_error(error):
    return render_template('500.html'), 500
