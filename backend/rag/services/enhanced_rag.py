"""
Enhanced RAG Service - Sistema RAG mejorado para agentes especializados
"""

import os
import logging
from typing import List, Dict, Any, Optional
from sentence_transformers import SentenceTransformer
import chromadb
from chromadb.config import Settings
import numpy as np
from datetime import datetime

logger = logging.getLogger(__name__)

class EnhancedRAGService:
    """
    Sistema RAG mejorado que integra con los agentes especializados
    para proporcionar búsqueda semántica avanzada en documentos.
    """
    
    def __init__(self):
        """Inicializar el servicio RAG mejorado"""
        self.logger = logging.getLogger(self.__class__.__name__)
        
        # Configuración
        self.embedding_model_name = os.getenv('EMBEDDING_MODEL', 'all-MiniLM-L6-v2')
        self.persist_directory = os.getenv('CHROMA_PERSIST_DIRECTORY', './chroma_db')
        
        # Inicializar modelo de embeddings
        try:
            self.embedding_model = SentenceTransformer(self.embedding_model_name)
            self.logger.info(f"Modelo de embeddings cargado: {self.embedding_model_name}")
        except Exception as e:
            self.logger.error(f"Error cargando modelo de embeddings: {e}")
            raise
        
        # Inicializar ChromaDB
        try:
            self.chroma_client = chromadb.PersistentClient(
                path=self.persist_directory,
                settings=Settings(
                    allow_reset=True,
                    anonymized_telemetry=False
                )
            )
            self.logger.info(f"ChromaDB inicializado en: {self.persist_directory}")
        except Exception as e:
            self.logger.error(f"Error inicializando ChromaDB: {e}")
            raise
    
    def process_document(self, document_content: str, user_id: str, 
                        document_metadata: Optional[Dict[str, Any]] = None) -> str:
        """
        Procesar y vectorizar documento para un usuario específico
        
        Args:
            document_content: Contenido del documento
            user_id: ID del usuario
            document_metadata: Metadatos adicionales del documento
        
        Returns:
            ID del documento procesado
        """
        try:
            # Validar entrada
            if not document_content.strip():
                raise ValueError("El contenido del documento está vacío")
            
            # Generar chunks del documento
            chunks = self._chunk_document(document_content)
            
            if not chunks:
                raise ValueError("No se pudieron generar chunks del documento")
            
            # Generar embeddings
            embeddings = self.embedding_model.encode(chunks)
            
            # Obtener o crear colección para el usuario
            collection_name = f"user_{user_id}"
            collection = self.chroma_client.get_or_create_collection(
                name=collection_name,
                metadata={"user_id": user_id}
            )
            
            # Preparar metadatos
            document_id = f"doc_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            base_metadata = {
                "user_id": user_id,
                "document_id": document_id,
                "timestamp": datetime.now().isoformat(),
                "chunk_count": len(chunks)
            }
            
            if document_metadata:
                base_metadata.update(document_metadata)
            
            # Preparar datos para inserción
            chunk_ids = [f"{document_id}_chunk_{i}" for i in range(len(chunks))]
            chunk_metadatas = []
            
            for i, chunk in enumerate(chunks):
                chunk_metadata = base_metadata.copy()
                chunk_metadata.update({
                    "chunk_index": i,
                    "chunk_text": chunk[:100] + "..." if len(chunk) > 100 else chunk
                })
                chunk_metadatas.append(chunk_metadata)
            
            # Insertar en ChromaDB
            collection.add(
                documents=chunks,
                embeddings=embeddings.tolist(),
                metadatas=chunk_metadatas,
                ids=chunk_ids
            )
            
            self.logger.info(f"Documento procesado: {document_id} - {len(chunks)} chunks para usuario {user_id}")
            return document_id
            
        except Exception as e:
            self.logger.error(f"Error procesando documento: {e}")
            raise
    
    def search_relevant_content(self, query: str, user_id: str, 
                               top_k: int = 5, filter_metadata: Optional[Dict] = None) -> List[str]:
        """
        Buscar contenido relevante para una consulta
        
        Args:
            query: Consulta de búsqueda
            user_id: ID del usuario
            top_k: Número máximo de resultados
            filter_metadata: Filtros adicionales de metadatos
        
        Returns:
            Lista de chunks relevantes
        """
        try:
            # Validar entrada
            if not query.strip():
                return []
            
            # Generar embedding de la consulta
            query_embedding = self.embedding_model.encode([query])
            
            # Obtener colección del usuario
            collection_name = f"user_{user_id}"
            
            try:
                collection = self.chroma_client.get_collection(collection_name)
            except Exception:
                # La colección no existe, usuario sin documentos
                self.logger.info(f"No se encontraron documentos para el usuario {user_id}")
                return []
            
            # Preparar filtros
            where_filter = {"user_id": user_id}
            if filter_metadata:
                where_filter.update(filter_metadata)
            
            # Realizar búsqueda
            results = collection.query(
                query_embeddings=query_embedding.tolist(),
                n_results=min(top_k, 10),  # Máximo 10 resultados
                where=where_filter,
                include=["documents", "metadatas", "distances"]
            )
            
            # Extraer documentos relevantes
            relevant_chunks = []
            if results and results.get('documents') and len(results['documents']) > 0:
                documents = results['documents'][0]
                distances = results.get('distances', [[]])[0]
                metadatas = results.get('metadatas', [[]])[0]
                
                # Filtrar por relevancia (distancia < 1.0 generalmente es relevante)
                for i, (doc, distance, metadata) in enumerate(zip(documents, distances, metadatas)):
                    if distance < 1.2:  # Umbral de relevancia ajustable
                        relevant_chunks.append(doc)
                        
                        # Log para debugging
                        self.logger.debug(f"Chunk relevante #{i+1} (dist: {distance:.3f}): {doc[:100]}...")
            
            self.logger.info(f"Búsqueda completada: {len(relevant_chunks)} chunks relevantes para '{query[:50]}...'")
            return relevant_chunks
            
        except Exception as e:
            self.logger.error(f"Error en búsqueda de contenido: {e}")
            return []
    
    def _chunk_document(self, document_content: str, chunk_size: int = 500, 
                       overlap: int = 50) -> List[str]:
        """
        Dividir documento en chunks con overlap
        
        Args:
            document_content: Contenido del documento
            chunk_size: Tamaño máximo de cada chunk en caracteres
            overlap: Overlap entre chunks en caracteres
        
        Returns:
            Lista de chunks de texto
        """
        try:
            # Limpiar contenido
            content = document_content.strip()
            
            if len(content) <= chunk_size:
                return [content]
            
            chunks = []
            start = 0
            
            while start < len(content):
                # Calcular fin del chunk
                end = start + chunk_size
                
                # Si no es el último chunk, buscar un punto de corte natural
                if end < len(content):
                    # Buscar punto de corte en los últimos 100 caracteres
                    search_start = max(end - 100, start)
                    search_text = content[search_start:end]
                    
                    # Buscar separadores naturales
                    separators = ['\n\n', '. ', '.\n', '\n', ';', ',']
                    best_cut = end
                    
                    for separator in separators:
                        separator_pos = search_text.rfind(separator)
                        if separator_pos != -1:
                            best_cut = search_start + separator_pos + len(separator)
                            break
                    
                    end = best_cut
                
                # Extraer chunk
                chunk = content[start:end].strip()
                if chunk:
                    chunks.append(chunk)
                
                # Mover inicio con overlap
                start = end - overlap if end < len(content) else len(content)
            
            return chunks
            
        except Exception as e:
            self.logger.error(f"Error chunking documento: {e}")
            return [document_content]  # Fallback: documento completo
    
    def get_user_documents(self, user_id: str) -> List[Dict[str, Any]]:
        """
        Obtener información de documentos de un usuario
        
        Args:
            user_id: ID del usuario
        
        Returns:
            Lista de información de documentos
        """
        try:
            collection_name = f"user_{user_id}"
            
            try:
                collection = self.chroma_client.get_collection(collection_name)
            except Exception:
                return []
            
            # Obtener todos los metadatos
            results = collection.get(include=["metadatas"])
            
            if not results or not results.get('metadatas'):
                return []
            
            # Agrupar por documento
            documents = {}
            for metadata in results['metadatas']:
                doc_id = metadata.get('document_id')
                if doc_id and doc_id not in documents:
                    documents[doc_id] = {
                        'document_id': doc_id,
                        'timestamp': metadata.get('timestamp'),
                        'chunk_count': metadata.get('chunk_count', 0),
                        'metadata': {k: v for k, v in metadata.items() 
                                   if k not in ['user_id', 'document_id', 'chunk_index', 'chunk_text']}
                    }
            
            return list(documents.values())
            
        except Exception as e:
            self.logger.error(f"Error obteniendo documentos del usuario {user_id}: {e}")
            return []
    
    def delete_user_documents(self, user_id: str, document_id: Optional[str] = None) -> bool:
        """
        Eliminar documentos de un usuario
        
        Args:
            user_id: ID del usuario
            document_id: ID específico del documento (opcional)
        
        Returns:
            True si se eliminó exitosamente
        """
        try:
            collection_name = f"user_{user_id}"
            
            try:
                collection = self.chroma_client.get_collection(collection_name)
            except Exception:
                return True  # No hay documentos que eliminar
            
            if document_id:
                # Eliminar documento específico
                # Obtener IDs de chunks del documento
                results = collection.get(
                    where={"document_id": document_id},
                    include=["metadatas"]
                )
                
                if results and results.get('ids'):
                    collection.delete(ids=results['ids'])
                    self.logger.info(f"Documento {document_id} eliminado para usuario {user_id}")
            else:
                # Eliminar toda la colección del usuario
                self.chroma_client.delete_collection(collection_name)
                self.logger.info(f"Todos los documentos eliminados para usuario {user_id}")
            
            return True
            
        except Exception as e:
            self.logger.error(f"Error eliminando documentos: {e}")
            return False
    
    def get_collection_stats(self, user_id: str) -> Dict[str, Any]:
        """
        Obtener estadísticas de la colección de un usuario
        
        Args:
            user_id: ID del usuario
        
        Returns:
            Diccionario con estadísticas
        """
        try:
            collection_name = f"user_{user_id}"
            
            try:
                collection = self.chroma_client.get_collection(collection_name)
            except Exception:
                return {
                    'total_chunks': 0,
                    'total_documents': 0,
                    'collection_exists': False
                }
            
            # Contar total de chunks
            count_result = collection.count()
            
            # Obtener documentos únicos
            results = collection.get(include=["metadatas"])
            unique_docs = set()
            
            if results and results.get('metadatas'):
                for metadata in results['metadatas']:
                    doc_id = metadata.get('document_id')
                    if doc_id:
                        unique_docs.add(doc_id)
            
            return {
                'total_chunks': count_result,
                'total_documents': len(unique_docs),
                'collection_exists': True,
                'collection_name': collection_name
            }
            
        except Exception as e:
            self.logger.error(f"Error obteniendo estadísticas: {e}")
            return {
                'total_chunks': 0,
                'total_documents': 0,
                'collection_exists': False,
                'error': str(e)
            }
    
    def health_check(self) -> Dict[str, Any]:
        """
        Verificar estado de salud del sistema RAG
        
        Returns:
            Diccionario con estado de salud
        """
        health_status = {
            'status': 'healthy',
            'embedding_model': self.embedding_model_name,
            'persist_directory': self.persist_directory,
            'timestamp': datetime.now().isoformat()
        }
        
        try:
            # Verificar ChromaDB
            collections = self.chroma_client.list_collections()
            health_status['chroma_collections'] = len(collections)
            
            # Test de embedding
            test_embedding = self.embedding_model.encode(["test"])
            health_status['embedding_dimension'] = len(test_embedding)
            
        except Exception as e:
            health_status['status'] = 'unhealthy'
            health_status['error'] = str(e)
            self.logger.error(f"Health check failed: {e}")
        
        return health_status 