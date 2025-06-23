import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  File, 
  Trash2, 
  Download, 
  Eye, 
  Plus,
  FileText,
  Image,
  Archive,
  Folder,
  Search,
  Filter
} from 'lucide-react';
import { Template } from '@/lib/types';
import { DataStore } from '@/lib/data-store';

export function TemplateManager() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isUploading, setIsUploading] = useState(false);

  const dataStore = DataStore.getInstance();

  React.useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = () => {
    const allTemplates = dataStore.getAllTemplates();
    setTemplates(allTemplates);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    
    try {
      for (const file of files) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const fileData = e.target?.result as string;
          const templateData = {
            name: file.name.split('.')[0],
            type: getFileType(file.name),
            fileName: file.name,
            fileSize: file.size,
            fileData: fileData.split(',')[1], // Remove data URL prefix
          };

          dataStore.addTemplate(templateData);
          loadTemplates();
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const getFileType = (fileName: string): Template['type'] => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (['pdf', 'doc', 'docx'].includes(extension || '')) {
      if (fileName.toLowerCase().includes('resume') || fileName.toLowerCase().includes('cv')) {
        return 'resume';
      }
      if (fileName.toLowerCase().includes('cover') || fileName.toLowerCase().includes('letter')) {
        return 'cover_letter';
      }
    }
    if (['jpg', 'jpeg', 'png', 'gif', 'pdf'].includes(extension || '')) {
      return 'portfolio';
    }
    return 'other';
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      dataStore.deleteTemplate(id);
      loadTemplates();
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FileText className="h-8 w-8 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="h-8 w-8 text-blue-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <Image className="h-8 w-8 text-green-500" />;
      case 'zip':
      case 'rar':
        return <Archive className="h-8 w-8 text-purple-500" />;
      default:
        return <File className="h-8 w-8 text-gray-500" />;
    }
  };

  const getTypeColor = (type: Template['type']) => {
    const colors = {
      resume: 'bg-blue-100 text-blue-800',
      cover_letter: 'bg-green-100 text-green-800',
      portfolio: 'bg-purple-100 text-purple-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[type];
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.fileName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || template.type === selectedType;
    return matchesSearch && matchesType;
  });

  const templateTypes = [
    { value: 'all', label: 'All Templates', icon: Folder },
    { value: 'resume', label: 'Resume', icon: FileText },
    { value: 'cover_letter', label: 'Cover Letter', icon: FileText },
    { value: 'portfolio', label: 'Portfolio', icon: Image },
    { value: 'other', label: 'Other', icon: File }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Document Templates
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Manage your resumes, cover letters, and other application materials
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <input
            type="file"
            id="file-upload"
            multiple
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            onClick={() => document.getElementById('file-upload')?.click()}
            disabled={isUploading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Upload className="h-4 w-4 mr-2" />
            {isUploading ? 'Uploading...' : 'Upload Files'}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2 overflow-x-auto">
              {templateTypes.map((type) => (
                <Button
                  key={type.value}
                  variant={selectedType === type.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedType(type.value)}
                  className="whitespace-nowrap"
                >
                  <type.icon className="h-4 w-4 mr-2" />
                  {type.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Area */}
      {templates.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-2 border-dashed border-slate-300 dark:border-slate-600">
            <CardContent className="p-12 text-center">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Upload className="mx-auto h-16 w-16 text-slate-400 mb-4" />
              </motion.div>
              <h3 className="text-xl font-medium text-slate-900 dark:text-slate-100 mb-2">
                Upload Your Templates
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
                Upload your resume, cover letters, portfolio pieces, and other documents 
                to use in your job applications.
              </p>
              <Button
                onClick={() => document.getElementById('file-upload')?.click()}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Upload className="h-5 w-5 mr-2" />
                Choose Files
              </Button>
              <p className="text-xs text-slate-500 mt-4">
                Supports PDF, DOC, DOCX, JPG, PNG files up to 10MB
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Templates Grid */}
      {filteredTemplates.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredTemplates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="group"
              >
                <Card className="h-full shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        {getFileIcon(template.fileName)}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {template.name}
                          </h3>
                          <p className="text-sm text-slate-500 truncate">
                            {template.fileName}
                          </p>
                        </div>
                      </div>
                      
                      <Badge className={`${getTypeColor(template.type)} text-xs`}>
                        {template.type.replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                      <span>Size: {formatFileSize(template.fileSize)}</span>
                      <span>
                        {new Date(template.uploadDate).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2 border-t">
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-2 h-8 w-8 hover:bg-blue-50 hover:text-blue-600"
                          title="Preview"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-2 h-8 w-8 hover:bg-green-50 hover:text-green-600"
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(template.id)}
                        className="p-2 h-8 w-8 hover:bg-red-50 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Empty State for Filtered Results */}
      {templates.length > 0 && filteredTemplates.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Filter className="mx-auto h-12 w-12 text-slate-400 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
            No templates found
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            Try adjusting your search or filter criteria
          </p>
        </motion.div>
      )}

      {/* Quick Actions */}
      {templates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Button variant="outline" className="justify-start">
                <Plus className="h-4 w-4 mr-2" />
                Create New Template
              </Button>
              <Button variant="outline" className="justify-start">
                <Download className="h-4 w-4 mr-2" />
                Download All
              </Button>
              <Button variant="outline" className="justify-start">
                <Archive className="h-4 w-4 mr-2" />
                Export Archive
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 