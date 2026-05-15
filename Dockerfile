FROM ubuntu:22.04 AS build

ENV DEBIAN_FRONTEND=noninteractive

# Install build dependencies
RUN apt-get update && apt-get install -y \
    build-essential cmake git libboost-all-dev libssl-dev \
    libcurl4-openssl-dev nlohmann-json3-dev python3-dev pybind11-dev \
    libpq-dev libpqxx-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . .

# Build components one by one to save memory
RUN cd broker && mkdir -p build && cd build && cmake .. && make -j1 && rm -rf CMakeFiles
RUN cd executor && mkdir -p build && cd build && cmake .. && make -j1 && rm -rf CMakeFiles
RUN cd engine && mkdir -p build && cd build && cmake .. && make -j1 && rm -rf CMakeFiles
RUN cd datafeed && mkdir -p build && cd build && cmake .. && make -j1 && rm -rf CMakeFiles

FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    supervisor nginx postgresql-client \
    libboost-thread1.74.0 libboost-system1.74.0 libboost-filesystem1.74.0 libboost-chrono1.74.0 libboost-atomic1.74.0 \
    libssl3 libcurl4 libpq5 libpqxx-7.7 \
    libpython3.10 python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Install Research Backend Dependencies
# Using --no-cache-dir to save space/memory
RUN pip3 install --no-cache-dir flask flask-cors numpy pandas matplotlib scikit-learn

WORKDIR /app

# Copy binaries
COPY --from=build /app/broker/build/eadapter ./broker/eadapter
COPY --from=build /app/executor/build/executor ./executor/executor
COPY --from=build /app/engine/build/engine ./engine/engine
COPY --from=build /app/datafeed/build/datafeed ./datafeed/datafeed

# Assets
COPY database/init.sql ./database/init.sql
COPY engine/algos ./algos
COPY research_executor.py .
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

# Configs
COPY supervisord.conf /etc/supervisor/supervisord.conf
COPY nginx.conf /etc/nginx/nginx.conf

# Env
ENV PYTHONPATH="/app:/app/engine:/app/algos"
ENV PYTHONUNBUFFERED=1
ENV PORT=80

EXPOSE 80

ENTRYPOINT ["/app/entrypoint.sh"]
unctionDef) and (subnode.name == 'on_tick' or subnode.name == 'onTick'):
                        has_on_tick = True
                        break
        
        if not has_class:
            return jsonify({'valid': False, 'error': 'Missing strategy class.'})
        if not has_on_tick:
            return jsonify({'valid': False, 'error': "Missing 'on_tick' method."})
            
        return jsonify({'valid': True})
    except SyntaxError as e:
        return jsonify({'valid': False, 'error': f'Syntax Error: {str(e)}'})
    except Exception as e:
        return jsonify({'valid': False, 'error': str(e)})

def validate_cpp(code):
    # Check for required symbols
    if 'onTick' not in code:
        return jsonify({'valid': False, 'error': "Missing 'onTick' method."})
    if 'Algo' not in code:
        return jsonify({'valid': False, 'error': "Strategy must inherit from 'Algo'."})
        
    # Attempt compilation
    try:
        with tempfile.TemporaryDirectory() as tmpdir:
            cpp_file = os.path.join(tmpdir, 'validate.cpp')
            with open(cpp_file, 'w') as f:
                f.write(code)
            
            result = subprocess.run(
                ['clang++', '-std=c++17', '-fsyntax-only', cpp_file],
                capture_output=True,
                text=True,
                timeout=10
            )
            
            if result.returncode != 0:
                return jsonify({'valid': False, 'error': f'Compilation Error:\n{result.stderr}'})
                
        return jsonify({'valid': True})
    except Exception as e:
        return jsonify({'valid': False, 'error': f'Validation failed: {str(e)}'})

def validate_ipynb(code):
    try:
        notebook = json.loads(code)
        python_code = ""
        for cell in notebook:
            if cell.get('type') == 'code':
                python_code += cell.get('content', '') + "\n"
        
        if not python_code.strip():
            return jsonify({'valid': False, 'error': 'No code cells found in notebook.'})
            
        # Basic syntax check on combined code
        ast.parse(python_code)
        return jsonify({'valid': True})
    except Exception as e:
        return jsonify({'valid': False, 'error': f'Invalid Notebook Format: {str(e)}'})


def execute_python_cell_with_capture(code):
    """
    Run Python code in a subprocess with a wrapper that captures
    stdout and any matplotlib figures. Returns a list of output dicts.
    """
    wrapper = r"""
import sys, json, base64, io, traceback
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

# Capture stdout
_old_stdout = sys.stdout
_captured = io.StringIO()
sys.stdout = _captured

_result_outputs = []

try:
    exec(sys.argv[1])
finally:
    sys.stdout = _old_stdout
    _text = _captured.getvalue()
    if _text.strip():
        _result_outputs.append({"type": "text", "data": _text.rstrip()})

    # Check for any figures created
    _fig_nums = plt.get_fignums()
    if _fig_nums:
        for _num in _fig_nums:
            _fig = plt.figure(_num)
            _buf = io.BytesIO()
            _fig.savefig(_buf, format='png')
            _buf.seek(0)
            _img_b64 = base64.b64encode(_buf.read()).decode('ascii')
            _result_outputs.append({"type": "image/png", "data": _img_b64})
            plt.close(_fig)

    # Print JSON result to stdout for the parent to capture
    print(json.dumps(_result_outputs))
"""

    try:
        # Pass the user code as an argument to the wrapper script
        result = subprocess.run(
            [sys.executable, '-c', wrapper, code],
            capture_output=True, text=True, timeout=10
        )
        # The wrapper's final print is the JSON outputs list
        if result.stdout.strip():
            try:
                outputs = json.loads(result.stdout.strip())
                return outputs
            except json.JSONDecodeError:
                # If something went wrong, return the raw output as text
                return [{"type": "text", "data": result.stdout.strip()}]
        else:
            return [{"type": "text", "data": result.stderr.strip()}] if result.stderr.strip() else []
    except subprocess.TimeoutExpired:
        return [{"type": "error", "data": "Execution timed out (>10s)"}]
    except Exception as e:
        return [{"type": "error", "data": f"Internal error: {str(e)}"}]

@app.route('/run', methods=['POST'])
def run_code():
    """Execute code from the editor"""
    try:
        data = request.json
        code = data.get('code', '')
        language = data.get('language', 'python')
        
        logger.info(f"Running {language} code")
        
        if not code:
            return jsonify({'error': 'No code provided'}), 400
        
        if language == 'python':
            return run_python(code)
        elif language == 'cpp':
            return run_cpp(code)
        elif language == 'ipynb':
            # Extract Python code from notebook cells
            try:
                notebook = json.loads(code)
                python_code = ""
                for cell in notebook:
                    if cell.get('type') == 'code':
                        python_code += cell.get('content', '') + "\n"
                if not python_code.strip():
                    return jsonify({'error': 'No code cells found in notebook.'}), 400
                return run_python(python_code)
            except json.JSONDecodeError:
                return jsonify({'error': 'Invalid notebook format'}), 400
        else:
            return jsonify({'error': f'Unsupported language: {language}'}), 400
            
    except Exception as e:
        logger.error(f"Run exception: {str(e)}")
        return jsonify({'error': str(e)}), 500
    

@app.route('/run-cell', methods=['POST'])
def run_cell():
    """Execute a single notebook cell and return rich outputs (text, images, error)."""
    try:
        data = request.json
        code = data.get('code', '')
        language = data.get('language', 'python')
        
        if not code:
            return jsonify({'error': 'No code provided'}), 400
        
        # Only Python cells can produce rich output; C++ would need separate handling.
        if language == 'python':
            outputs = execute_python_cell_with_capture(code)
        else:
            # For other languages, fall back to the existing subprocess runner
            # but we still return a uniform output format.
            result = subprocess.run(
                [sys.executable, '-c', code],
                capture_output=True, text=True, timeout=10
            )
            stdout = result.stdout.strip()
            stderr = result.stderr.strip()
            outputs = []
            if stdout:
                outputs.append({"type": "text", "data": stdout})
            if stderr:
                outputs.append({"type": "error", "data": stderr})
        
        return jsonify({'success': True, 'outputs': outputs})
    except Exception as e:
        return jsonify({'success': False, 'outputs': [{'type': 'error', 'data': str(e)}]}), 500


def run_python(code):
    """Execute Python code"""
    try:
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
            f.write(code)
            f.flush()
            temp_file = f.name
        
        try:
            result = subprocess.run(
                [sys.executable, temp_file],
                capture_output=True,
                text=True,
                timeout=10
            )
            output = result.stdout if result.stdout else result.stderr
            return jsonify({
                'success': result.returncode == 0,
                'output': output,
                'error': result.stderr if result.returncode != 0 else None
            })
        finally:
            os.unlink(temp_file)
            
    except subprocess.TimeoutExpired:
        return jsonify({'error': 'Code execution timeout (>10s)'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def run_cpp(code):
    """Execute C++ code (compile then run)"""
    try:
        with tempfile.TemporaryDirectory() as tmpdir:
            cpp_file = os.path.join(tmpdir, 'strategy.cpp')
            exe_file = os.path.join(tmpdir, 'strategy')
            
            with open(cpp_file, 'w') as f:
                f.write(code)
            
            # Compile C++ code
            compile_result = subprocess.run(
                ['clang++', '-std=c++17', cpp_file, '-o', exe_file],
                capture_output=True,
                text=True,
                timeout=15
            )
            
            if compile_result.returncode != 0:
                return jsonify({
                    'success': False,
                    'output': '',
                    'error': compile_result.stderr
                })
            
            # Run compiled executable
            run_result = subprocess.run(
                [exe_file],
                capture_output=True,
                text=True,
                timeout=10
            )
            
            return jsonify({
                'success': run_result.returncode == 0,
                'output': run_result.stdout if run_result.stdout else "Compiled and executed successfully",
                'error': run_result.stderr if run_result.returncode != 0 else None
            })
            
    except subprocess.TimeoutExpired:
        return jsonify({'error': 'Code execution timeout (>10s)'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/save-strategy', methods=['POST'])
def save_strategy():
    """Save a strategy file to disk"""
    try:
        data = request.json
        name = data.get('name', 'strategy')
        content = data.get('content', '')
        language = data.get('language', 'python')
        
        logger.info(f"Saving strategy: {name}")
        
        # Determine file extension
        ext_map = {'python': 'py', 'cpp': 'cpp', 'ipynb': 'ipynb'}
        ext = ext_map.get(language, 'py')
        
        # Save to strategy directory
        strategy_file = STRATEGY_DIR / f"{name}.{ext}"
        with open(strategy_file, 'w') as f:
            f.write(content)
        
        logger.info(f"Strategy saved to {strategy_file}")
        
        return jsonify({
            'success': True,
            'message': f'Strategy saved to {strategy_file}',
            'path': str(strategy_file)
        })
        
    except Exception as e:
        logger.error(f"Save strategy error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/list-strategies', methods=['GET'])
def list_strategies():
    """List all saved strategy files"""
    try:
        strategies = []
        for file in STRATEGY_DIR.glob('*'):
            if file.is_file():
                strategies.append({
                    'name': file.stem,
                    'language': 'ipynb' if file.suffix == '.ipynb' else file.suffix.lstrip('.'),
                    'path': str(file),
                    'size': file.stat().st_size
                })
        
        return jsonify({'strategies': strategies})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/load-strategy', methods=['GET'])
def load_strategy():
    """Load a strategy file"""
    try:
        name = request.args.get('name')
        if not name:
            return jsonify({'error': 'Strategy name required'}), 400
        
        # Search for file with any extension
        for file in STRATEGY_DIR.glob(f"{name}.*"):
            if file.is_file():
                with open(file, 'r') as f:
                    content = f.read()
                
                ext_to_lang = {
                    '.py': 'python',
                    '.cpp': 'cpp',
                    '.ipynb': 'ipynb'
                }
                language = ext_to_lang.get(file.suffix, 'python')
                
                return jsonify({
                    'name': file.stem,
                    'language': language,
                    'content': content,
                    'path': str(file)
                })
        
        return jsonify({'error': f'Strategy {name} not found'}), 404
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'service': 'research_executor'})

if __name__ == '__main__':
    port = int(os.getenv('RESEARCH_BACKEND_PORT', '5001'))
    logger.info(f"Research Executor Backend starting on http://localhost:{port}")
    app.run(debug=False, host='0.0.0.0', port=port)
