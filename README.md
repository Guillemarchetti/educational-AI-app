# 🚀 ContextAI - Plataforma Educativa con IA Contextual

A comprehensive educational platform built with Django backend and Next.js frontend, featuring AI agents, RAG systems, and advanced document processing capabilities.

## 📋 **Project Overview**

ContextAI es una plataforma educativa completa que combina:
- **Django Backend** - RESTful API with AI agents and RAG system
- **Next.js Frontend** - Modern React-based user interface
- **AI Agents** - Content creation and educational assistance
- **Document Processing** - Advanced PDF and document handling
- **Real-time Features** - WebSocket communication and live updates

## 🏗️ **Project Structure**

```
APP-Educacion/
├── 📁 backend/                    # Django backend
│   ├── 📁 apps/                   # Django apps
│   │   ├── 📁 agents/             # AI agents system
│   │   │   ├── 📁 services/       # Agent services
│   │   │   └── 📁 api/            # Agent APIs
│   │   └── 📁 documents/          # Document management
│   │       ├── 📁 services/       # Document services
│   │       └── 📁 api/            # Document APIs
│   ├── 📁 authentication/         # Auth system
│   ├── 📁 rag/                    # RAG system
│   ├── 📁 backend_project/        # Django settings
│   ├── 📁 media/                  # User uploaded files
│   │   └── 📁 documents/          # Uploaded documents
│   ├── 📁 uploads/                # Static PDF files
│   ├── 📁 logs/                   # Application logs
│   ├── manage.py
│   ├── requirements.txt
│   └── db.sqlite3
│
├── 📁 frontend/                   # Next.js frontend
│   ├── 📁 app/                    # Next.js 13+ app directory
│   ├── 📁 components/             # React components
│   │   └── 📁 enterprise/         # Enterprise UI components
│   ├── 📁 public/                 # Static assets
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── next.config.js
│
├── 📁 scripts/                    # Utility scripts
│   ├── setup_project.sh           # Complete project setup
│   ├── start_servers_cross.sh     # Cross-platform server startup
│   ├── stop_servers.sh            # Stop all servers
│   └── setup_agents.sh            # AI agents setup
│
├── 📁 docs/                       # Documentation
│   ├── FASE_1_COMPLETADA.md
│   ├── FASE_2_COMPLETADA.md
│   ├── PLAN_AGENTES_IA.md
│   └── PLAN_ESTRUCTURA_DOCUMENTOS.md
│
├── 📁 tests/                      # Test files
│   ├── test_structure_analysis.py
│   └── test_content_creator_agent.py
│
├── 📁 logs/                       # Log files
│   ├── backend.log
│   └── frontend.log
│
├── .gitignore                     # Git ignore rules
└── README.md                      # This file
```

## 🛠️ **Technology Stack**

### **Backend (Django)**
- **Django 4.2.7** - Web framework
- **Django REST Framework** - API development
- **OpenAI/Anthropic** - AI integrations
- **ChromaDB** - Vector database
- **PyMuPDF** - PDF processing
- **Celery** - Background tasks

### **Frontend (Next.js)**
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React Query** - Server state

## 🚀 **Setup and Installation**

### **Prerequisites**

Before starting, make sure you have the following installed:

- **Python 3.8+** - [Download here](https://www.python.org/downloads/)
- **Node.js 18+** - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** - [Download here](https://git-scm.com/)

### **Installation Options**

#### **Option 1: Automated Setup (Recommended) 🚀**

The easiest way to set up the entire project:

```bash
# Clone the repository
git clone <repository-url>
cd APP-Educacion

# Run the automated setup script
bash scripts/setup_project.sh
```

**What this script does:**
- ✅ Detects your operating system (Windows, macOS, Linux)
- ✅ Verifies all prerequisites (Python, Node.js, Git)
- ✅ Creates Python virtual environment
- ✅ Installs all Python dependencies
- ✅ Installs all Node.js dependencies
- ✅ Creates necessary directories
- ✅ Runs Django migrations
- ✅ Sets up environment variables
- ✅ Verifies the installation

#### **Option 2: Manual Setup**

If you prefer to set up manually or need more control:

```bash
# 1. Clone the repository
git clone <repository-url>
cd APP-Educacion

# 2. Setup Backend
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
cd ..

# 3. Setup Frontend
cd frontend
npm install
cd ..

# 4. Create necessary directories
mkdir -p uploads
mkdir -p backend/static

# 5. Configure environment variables
cp backend/env_example backend/.env
# Edit backend/.env with your API keys
```

### **Configuration**

#### **API Keys Setup**

After installation, configure your API keys:

1. Edit `backend/.env`:
```env
# Django Configuration
SECRET_KEY=django-insecure-change-this-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# API Keys (IMPORTANT: Configure these keys)
OPENAI_API_KEY=your-openai-api-key-here
ANTHROPIC_API_KEY=your-anthropic-api-key-here

# Model Configuration
OPENAI_MODEL=gpt-4
RAG_MAX_CONTEXT_LENGTH=4000
RAG_MAX_DOCUMENTS=10
RAG_EMBEDDING_MODEL=all-MiniLM-L6-v2
```

## 🚀 **Running the Application**

### **Starting the Servers**

#### **Option 1: Using the Cross-Platform Script (Recommended)**

```bash
# Start both servers
bash scripts/start_servers.sh
```

**What this script does:**
- ✅ Detects your operating system
- ✅ Closes any processes using ports 3000 and 8000
- ✅ Starts Django backend on port 8000
- ✅ Starts Next.js frontend on port 3000
- ✅ Verifies both servers are running
- ✅ Shows status and useful commands

#### **Option 2: Manual Startup**

**Start Backend:**
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python manage.py runserver 8000
```

**Start Frontend (in a new terminal):**
```bash
cd frontend
npm run dev
```

### **Accessing the Application**

Once both servers are running:

- **Frontend Application**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Django Admin**: http://localhost:8000/admin

### **Stopping the Application**

#### **Using the Stop Script:**
```bash
bash scripts/stop_servers.sh
```

#### **Manual Stop:**
- Press `Ctrl+C` in each terminal window
- Or kill processes on ports 3000 and 8000

## 🔧 **Available Scripts**

### **Setup and Installation**
```bash
# Complete project setup
bash scripts/setup_project.sh

### **Server Management**
```bash
# Start servers 
bash scripts/start_servers.sh

# Stop servers
bash scripts/stop_servers.sh
```

### **Development Commands**
```bash
# Frontend
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # Code linting

# Backend
python manage.py runserver    # Development server
python manage.py migrate      # Database migrations
python manage.py collectstatic # Collect static files
python manage.py test         # Run tests
```

## 📝 **Development Workflow**

### **Daily Development:**
1. Start servers: `bash scripts/start_servers.sh`
2. Make your changes
3. Stop servers: `bash scripts/stop_servers.sh`

### **Adding New Dependencies:**
```bash
# Backend (Python)
cd backend
source venv/bin/activate
pip install <package-name>
pip freeze > requirements.txt

# Frontend (Node.js)
cd frontend
npm install <package-name>
```

## 🎯 **Key Features**

- **AI-Powered Content Creation** - Automated educational content generation
- **Document Processing** - Advanced PDF and document analysis
- **Real-time Communication** - Live chat and updates
- **RAG System** - Retrieval-Augmented Generation for knowledge
- **Multi-user Support** - User authentication and roles
- **Responsive Design** - Mobile-friendly interface
- **API-First Architecture** - RESTful API design

## 📚 **Documentation**

- **Phase 1 Completion** - See `docs/FASE_1_COMPLETADA.md`
- **Phase 2 Completion** - See `docs/FASE_2_COMPLETADA.md`
- **AI Agents Plan** - See `docs/PLAN_AGENTES_IA.md`
- **Document Structure Plan** - See `docs/PLAN_ESTRUCTURA_DOCUMENTOS.md`

## 🤝 **Contributing**

1. Follow the established project structure
2. Use TypeScript for frontend development
3. Follow Django best practices for backend
4. Write tests for new features
5. Update documentation as needed

## 🚀 **Production Deployment**

For production deployment, see the documentation in the `docs/` directory.

## 📄 **License**

This project is proprietary software. All rights reserved.

---

**Need Help?** Check the logs in the `logs/` directory or refer to the troubleshooting section in the documentation. 