import os
import torchvision.transforms as transforms
from torchvision.datasets import ImageFolder

import torch
import torch.nn as nn
import torchvision.models as models


# Chemin des datasets
base_dir = '/Users/nabyl/Desktop/Mini_projets/'
katakana_dir = os.path.join(base_dir, 'kana/katakana')
hiragana_dir = os.path.join(base_dir, 'Kana/Hiragana')



# Define transformations for image preprocessing
transform = transforms.Compose([
    transforms.Resize((64, 64)),  # Resize the images to a consistent size
    transforms.ToTensor(),  # Convert images to tensors
    transforms.Normalize((0.5,), (0.5,))  # Normalize the image tensors
])

# Define paths to your training and validation data folders
train_folder = "kana/katakana"
val_folder = "kana/katakana"

# Load the training dataset
train_dataset = ImageFolder(train_folder, transform=transform)

# Load the validation dataset
val_dataset = ImageFolder(val_folder, transform=transform)

# Create data loaders for batching and shuffling the data
train_loader = torch.utils.data.DataLoader(train_dataset, batch_size=32, shuffle=True)
val_loader = torch.utils.data.DataLoader(val_dataset, batch_size=32, shuffle=False)


# Load the pre-trained ResNet model
resnet = models.resnet18(pretrained=True)

# Modify the last fully connected layer to match the number of Kana classes
num_classes = 46  # Replace with the actual number of Kana classes
resnet.fc = nn.Linear(resnet.fc.in_features, num_classes)

# Define a loss function
criterion = nn.CrossEntropyLoss()

# Define an optimizer for updating the model parameters
optimizer = torch.optim.Adam(resnet.parameters(), lr=0.001)

# Training loop
num_epochs = 10

for epoch in range(num_epochs):
    resnet.train()  # Set the model to training mode
    train_loss = 0.0

    for images, labels in train_loader:
        # Forward pass
        outputs = resnet(images)
        loss = criterion(outputs, labels)

        # Backward pass and optimization
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

        train_loss += loss.item()

    # Compute the average training loss for the epoch
    avg_train_loss = train_loss / len(train_loader)

    # Perform validation after each epoch
    resnet.eval()  # Set the model to evaluation mode
    val_loss = 0.0

    with torch.no_grad():
        for images, labels in val_loader:
            outputs = resnet(images)
            loss = criterion(outputs, labels)
            val_loss += loss.item()

    # Compute the average validation loss for the epoch
    avg_val_loss = val_loss / len(val_loader)

    # Print the training and validation losses
    print(f'Epoch [{epoch+1}/{num_epochs}], Train Loss: {avg_train_loss:.4f}, Val Loss: {avg_val_loss:.4f}')


# Define the path to your test data folder
test_folder = "kana/katakana"

# Load the test dataset
test_dataset = ImageFolder(test_folder, transform=transform)

# Create a data loader for the test dataset
test_loader = torch.utils.data.DataLoader(test_dataset, batch_size=32, shuffle=False)

resnet.eval()  # Set the model to evaluation mode
test_loss = 0.0
correct = 0
total = 0

with torch.no_grad():
    for images, labels in test_loader:
        outputs = resnet(images)
        loss = criterion(outputs, labels)
        test_loss += loss.item()

        _, predicted = torch.max(outputs.data, 1)
        total += labels.size(0)
        correct += (predicted == labels).sum().item()

# Compute the average test loss and accuracy
avg_test_loss = test_loss / len(test_loader)
accuracy = correct / total

print(f'Test Loss: {avg_test_loss:.4f}, Accuracy: {accuracy:.4f}')

# Save the trained model
torch.save(resnet.state_dict(), 'KataModel.pth')



