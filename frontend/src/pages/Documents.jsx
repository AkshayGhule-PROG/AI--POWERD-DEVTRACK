import { useCallback, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useDropzone } from 'react-dropzone'
import {
  DocumentArrowUpIcon, DocumentTextIcon, ArrowPathIcon,
  CheckCircleIcon, ExclamationCircleIcon, ClockIcon, XCircleIcon,
} from '@heroicons/react/24/outline'
import api from '@/lib/api'
import { formatRelativeTime } from '@/lib/utils'
import toast from 'react-hot-toast'
import { useEffect } from 'react'
import { connectSocket, disconnectSocket } from '@/lib/socket'

const StatusIcon = ({ status }) => {
  switch (status) {
    case 'processed': return <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
    case 'processing': return <ArrowPathIcon className="w-5 h-5 text-blue-600 animate-spin" />
    case 'failed': return <XCircleIcon className="w-5 h-5 text-red-500" />
    default: return <ClockIcon className="w-5 h-5 text-gray-400" />
  }
}

const statusColors = {
  uploaded: 'bg-gray-100 text-gray-500',
  processing: 'bg-blue-50 text-blue-600 border border-blue-200',
  processed: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  failed: 'bg-red-50 text-red-600 border border-red-200',
}

export default function DocumentsPage() {
  const { id: projectId } = useParams()
  const qc = useQueryClient()

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['documents', projectId],
    queryFn: async () => {
      const { data } = await api.get(`/documents/project/${projectId}`)
      return data.data
    },
    refetchInterval: (query) => {
      const docs = query.state.data || []
      return docs.some((d) => d.status === 'processing') ? 3000 : false
    },
  })

  // Socket.io: listen for document:ingested events
  useEffect(() => {
    const socket = connectSocket(projectId)
    socket.on('document:ingested', () => {
      qc.invalidateQueries(['documents', projectId])
    })
    return () => {
      socket.off('document:ingested')
      disconnectSocket(projectId)
    }
  }, [projectId, qc])

  const uploadMutation = useMutation({
    mutationFn: async (files) => {
      const results = []
      for (const file of files) {
        const fd = new FormData()
        fd.append('document', file)
        const { data } = await api.post(`/documents/upload/${projectId}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        results.push(data)
      }
      return results
    },
    onSuccess: () => {
      qc.invalidateQueries(['documents', projectId])
      toast.success('Document(s) uploaded and ingestion started!')
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Upload failed'),
  })

  const reingestMutation = useMutation({
    mutationFn: (docId) => api.post(`/documents/${docId}/reingest`),
    onSuccess: () => {
      qc.invalidateQueries(['documents', projectId])
      toast.success('Re-ingestion started')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (docId) => api.delete(`/documents/${docId}`),
    onSuccess: () => {
      qc.invalidateQueries(['documents', projectId])
      toast.success('Document deleted')
    },
  })

  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles.length) uploadMutation.mutate(acceptedFiles)
    },
    [uploadMutation]
  )

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
      'text/x-markdown': ['.md'],
    },
    maxSize: 50 * 1024 * 1024,
    multiple: true,
  })

  const processing = documents.filter((d) => d.status === 'processing')
  const processed = documents.filter((d) => d.status === 'processed')
  const failed = documents.filter((d) => d.status === 'failed')

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">SRS Documents</h1>
        <p className="text-gray-400 text-sm">
          {processed.length} processed · {documents.length} total
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total', value: documents.length, color: 'text-gray-700' },
          { label: 'Processed', value: processed.length, color: 'text-emerald-600' },
          { label: 'Processing', value: processing.length, color: 'text-blue-600' },
          { label: 'Failed', value: failed.length, color: 'text-red-500' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-4 text-center">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all mb-6 ${
          isDragActive
            ? 'border-primary-400 bg-primary-50'
            : 'border-gray-200 bg-gray-50 hover:border-primary-300 hover:bg-primary-50/40'
        }`}
      >
        <input {...getInputProps()} />
        <DocumentArrowUpIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        {uploadMutation.isPending ? (
          <p className="text-gray-500">
            <span className="animate-pulse">Uploading...</span>
          </p>
        ) : isDragActive ? (
          <p className="text-primary-600 font-medium">Drop files here</p>
        ) : (
          <>
            <p className="text-gray-700 font-medium">Drag & drop documents here</p>
            <p className="text-gray-400 text-sm mt-1">Supports PDF, DOCX, TXT, MD · Max 50 MB per file</p>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); open(); }}
              className="btn-primary btn-sm mt-4"
            >
              <DocumentArrowUpIcon className="w-4 h-4" />
              Choose Files to Upload
            </button>
          </>
        )}
      </div>

      {/* Document list */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="card h-20 animate-pulse" />)}
        </div>
      ) : documents.length === 0 ? (
        <div className="card p-16 text-center">
          <DocumentTextIcon className="w-14 h-14 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-700 font-medium">No documents uploaded</p>
          <p className="text-gray-400 text-sm mt-1">Upload an SRS document to enable AI story generation</p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <div key={doc._id} className="card p-4 flex items-center gap-4 group">
              <StatusIcon status={doc.status} />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-white text-sm truncate">{doc.originalName}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[doc.status]}`}>
                    {doc.status}
                  </span>
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
                  <span className="text-xs text-gray-500">{doc.fileType?.toUpperCase()}</span>
                  {doc.ingestionStatus?.chunks > 0 && (
                    <span className="text-xs text-gray-500">{doc.ingestionStatus.chunks} chunks</span>
                  )}
                  {doc.ingestionStatus?.embeddings > 0 && (
                    <span className="text-xs text-gray-500">{doc.ingestionStatus.embeddings} embeddings</span>
                  )}
                  {doc.ingestionStatus?.processingTime > 0 && (
                    <span className="text-xs text-gray-500">{doc.ingestionStatus.processingTime.toFixed(1)}s</span>
                  )}
                  <span className="text-xs text-gray-600">{formatRelativeTime(doc.createdAt)}</span>
                </div>

                {doc.status === 'failed' && doc.ingestionStatus?.errorMessage && (
                  <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                    <ExclamationCircleIcon className="w-3.5 h-3.5" />
                    {doc.ingestionStatus.errorMessage}
                  </p>
                )}

                {doc.status === 'processing' && (
                  <div className="w-full mt-2 progress-bar">
                    <div className="progress-fill bg-blue-500 animate-pulse" style={{ width: '60%' }} />
                  </div>
                )}
              </div>

              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                {(doc.status === 'failed' || doc.status === 'processed') && (
                  <button
                    onClick={() => reingestMutation.mutate(doc._id)}
                    disabled={reingestMutation.isPending}
                    className="btn-secondary btn-sm"
                    title="Re-ingest"
                  >
                    <ArrowPathIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Re-ingest</span>
                  </button>
                )}
                <button
                  onClick={() => deleteMutation.mutate(doc._id)}
                  className="text-red-400 hover:text-red-300 btn-ghost btn-sm p-1"
                  title="Delete"
                >
                  <XCircleIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info box */}
      <div className="mt-6 p-4 rounded-xl bg-primary-50 border border-primary-200">
        <p className="text-sm text-primary-700 font-semibold mb-1">How it works</p>
        <ol className="text-xs text-gray-500 space-y-1 list-decimal list-inside">
          <li>Upload your SRS, requirements, or design document (PDF, DOCX, TXT or MD)</li>
          <li>DevTrack AI parses and embeds the document into a vector database</li>
          <li>Go to <strong className="text-gray-800">Stories</strong> and click <em>AI Generate</em> to create User Stories from the document</li>
        </ol>
      </div>
    </div>
  )
}
