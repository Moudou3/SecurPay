from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def home():
    return '<a href="/signup">Go to Sign Up</a>'

@app.route('/signup')
def signup():
    return render_template('signup.html')

if __name__ == '__main__':
    app.run(debug=True)
