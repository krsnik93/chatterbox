from chatterbox.app import app

if __name__ == '__main__':
    app.extensions['socketio'].run(app)
