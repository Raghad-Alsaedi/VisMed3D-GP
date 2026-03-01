'use client'

import { useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { UploadSignature } from '@/components/icons'

const AddSignature = () => {
  const router = useRouter()
  const { data: session } = useSession()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [currentSignatureUrl, setCurrentSignatureUrl] = useState<string | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [loadingSignature, setLoadingSignature] = useState(true)

  useEffect(() => {
    const fetchCurrentSignature = async () => {
      try {
        const doctorId = (session as any)?.user?.id
        if (!doctorId) {
          setLoadingSignature(false)
          return
        }

        const response = await fetch(`/api/doctor/dashboard?doctorId=${doctorId}`)
        const data = await response.json()
        
        if (data.doctor?.signature_url) {
          setCurrentSignatureUrl(data.doctor.signature_url)
        }
      } catch (error) {
        console.error('Error fetching signature:', error)
      } finally {
        setLoadingSignature(false)
      }
    }

    if (session) {
      fetchCurrentSignature()
    }
  }, [session])

  useEffect(() => {
    if (selectedFile && !isLoading && !errorMessage) {
      setShowSuccess(true)
      const timer = setTimeout(() => {
        setShowSuccess(false)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [selectedFile, isLoading, errorMessage])

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage('')
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [errorMessage])

  useEffect(() => {
    if (saveMessage && saveMessage.includes('successfully')) {
      const timer = setTimeout(() => {
        router.push('/doctor')
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [saveMessage, router])

  const handleFileSelect = (file: File) => {
    setIsLoading(true)
    setErrorMessage('')
    
    setTimeout(() => {
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg']
      if (!validTypes.includes(file.type)) {
        setErrorMessage('Invalid file type. Only PNG, JPG, and JPEG are allowed')
        setIsLoading(false)
        if (fileInputRef.current) fileInputRef.current.value = ''
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('File size exceeds 5MB. Please select a smaller image')
        setIsLoading(false)
        if (fileInputRef.current) fileInputRef.current.value = ''
        return
      }

      setSelectedFile(file)
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
        setIsLoading(false)
      }
      reader.readAsDataURL(file)
    }, 1000)
  }

  const handleClick = () => {
    if (!currentSignatureUrl || (isEditMode && !previewUrl)) {
      fileInputRef.current?.click()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileSelect(file)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (!currentSignatureUrl || (isEditMode && !previewUrl)) {
      const file = e.dataTransfer.files?.[0]
      if (file) handleFileSelect(file)
    }
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedFile(null)
    setPreviewUrl(null)
    setShowSuccess(false)
    setIsLoading(false)
    setErrorMessage('')
    setSaveMessage('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleEditClick = () => {
    setIsEditMode(true)
  }

  const handleCancel = () => {
    if (currentSignatureUrl && isEditMode) {
      setIsEditMode(false)
      setSelectedFile(null)
      setPreviewUrl(null)
      setShowSuccess(false)
      setIsLoading(false)
      setErrorMessage('')
      setSaveMessage('')
      if (fileInputRef.current) fileInputRef.current.value = ''
    } else {
      router.back()
    }
  }

  const handleConfirm = async () => {
    if (!selectedFile) return

    setIsSaving(true)
    setSaveMessage('')

    try {
      const formData = new FormData()
      formData.append('signature', selectedFile)

      const response = await fetch('/api/doctor/upload-signature', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        setSaveMessage('Signature saved successfully!')
      } else {
        setSaveMessage(data.error || 'Failed to save signature')
      }
    } catch (error) {
      console.error('Error uploading signature:', error)
      setSaveMessage('Network error. Please try again')
    } finally {
      setIsSaving(false)
    }
  }

  if (loadingSignature) {
    return (
      <div className="bg-[#040A16] min-h-screen flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
          <p className="text-white text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  const hasExistingSignature = currentSignatureUrl && !isEditMode
  const showNewPreview = previewUrl
  const showUploadArea = !hasExistingSignature && !showNewPreview

  return (
    <div className="bg-[#040A16] min-h-screen flex items-center justify-center p-4">
      <div className="bg-[#0D1A2D] w-full max-w-[400px] border border-white/30 rounded-[20px] px-6 sm:px-10 md:px-12 py-6 sm:py-8 relative">
        
        {hasExistingSignature && (
          <button
            onClick={handleEditClick}
            className="absolute top-4 right-4 bg-[#17387C] hover:bg-[#1e4a9a] text-white rounded-full p-2 z-10 transition-colors cursor-pointer"
            title="Edit Signature"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        )}

        <h1 className="text-white text-lg sm:text-xl md:text-[24px] font-semibold text-center mb-4 sm:mb-6">
          {hasExistingSignature ? 'Your Signature' : isEditMode ? 'Edit Signature' : 'Signature Upload'}
        </h1>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg"
          onChange={handleFileChange}
          className="hidden"
        />
        
        {errorMessage && (
          <p className="text-red-500 text-xs sm:text-sm text-center mb-2 font-medium">
            {errorMessage}
          </p>
        )}
        
        {saveMessage && (
          <p className={`text-xs sm:text-sm text-center mb-2 font-medium ${
            saveMessage.includes('successfully') ? 'text-[#1F9C3E]' : 'text-red-500'
          }`}>
            {saveMessage}
          </p>
        )}
        
        {isLoading && !errorMessage && !saveMessage && (
          <p className="text-white/50 text-xs sm:text-sm text-center mb-2 font-medium">
            Loading image...
          </p>
        )}
        
        {isSaving && (
          <p className="text-white/50 text-xs sm:text-sm text-center mb-2 font-medium">
            Saving signature...
          </p>
        )}
        
        {showSuccess && !isLoading && !errorMessage && !saveMessage && (
          <p className="text-[#1F9C3E] text-xs sm:text-sm text-center mb-2 font-medium">
            Image selected successfully!
          </p>
        )}
        
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`border-2 border-dashed border-white/30 rounded-[8px] p-5 sm:p-6 md:p-8 mb-4 sm:mb-6 text-center ${
            (showUploadArea || (isEditMode && !previewUrl)) ? 'cursor-pointer hover:border-white/50' : ''
          } relative`}
        >
          {hasExistingSignature && (
            <img
              src={currentSignatureUrl}
              alt="Current Signature"
              className="w-full h-32 sm:h-40 object-contain rounded"
            />
          )}

          {showNewPreview && (
            <>
              <button
                onClick={handleRemove}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 z-10 cursor-pointer transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-32 sm:h-40 object-contain rounded"
              />
            </>
          )}

          {showUploadArea && (
            <>
              <div className="mb-3 sm:mb-4">
                <svg
                  className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 mx-auto text-white/50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h2 className="text-white font-semibold text-xs sm:text-sm md:text-[16px] mb-1 sm:mb-2">
                Click or drag signature image here
              </h2>
              <p className="text-white/70 text-[10px] sm:text-xs md:text-[14px] mb-1">
                Supported Formats: PNG, JPG, JPEG
              </p>
              <p className="text-white/50 text-[9px] sm:text-[11px] md:text-[12px]">
                Maximum Image Size: 5MB
              </p>
            </>
          )}

          {isEditMode && !previewUrl && !showUploadArea && (
            <>
              <div className="mb-3 sm:mb-4">
                <UploadSignature className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 mx-auto text-white/50" />
              </div>
              <h2 className="text-white font-semibold text-xs sm:text-sm md:text-[16px] mb-1 sm:mb-2">
                Click or drag new signature image here
              </h2>
              <p className="text-white/70 text-[10px] sm:text-xs md:text-[14px] mb-1">
                Supported Formats: PNG, JPG, JPEG
              </p>
              <p className="text-white/50 text-[9px] sm:text-[11px] md:text-[12px]">
                Maximum Image Size: 5MB
              </p>
            </>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          {hasExistingSignature ? (
            <button
              onClick={() => router.push('/doctor')}
              className="w-full bg-[#17387C] hover:bg-[#1e4a9a] border border-white/30 rounded-[12px] py-2.5 sm:py-3 text-sm sm:text-base text-white cursor-pointer transition-colors"
            >
              Back to Profile
            </button>
          ) : (
            <>
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="w-full sm:flex-1 bg-transparent hover:border-white/60 border border-white/30 rounded-[12px] py-2.5 sm:py-3 text-sm sm:text-base text-white cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={!selectedFile || isSaving}
                className="w-full sm:flex-1 bg-[#17387C] hover:bg-[#1e4a9a] border border-white/30 rounded-[12px] py-2.5 sm:py-3 text-sm sm:text-base text-white cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : 'Yes, confirm'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default AddSignature